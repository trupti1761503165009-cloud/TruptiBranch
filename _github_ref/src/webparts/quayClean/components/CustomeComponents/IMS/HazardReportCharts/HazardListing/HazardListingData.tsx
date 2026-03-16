/* eslint-disable @typescript-eslint/no-use-before-define */
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";
import { useState } from "react";
import { useId } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, TooltipHost } from "office-ui-fabric-react";
import React from "react";
import { HazardFields, HazardViewFields } from "../../../../../../../Common/Enum/HazardFields";
import { logGenerator, generateExcelTable, generateAndSaveKendoHazardPDF } from "../../../../../../../Common/Util";
import { generateExcelFileName, getFileType } from "../../../../CommonComponents/CommonMethods";
import { IContextualMenuProps } from "@fluentui/react";
import { ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../../../DataProvider/Interface/IPnPQueryOptions";

interface ISelectedSites {
    ids: any[];
    titles: string[];
    scSites: string[];
}
interface IHazardData {
    HazardData: any[];
    PDFData: any[];
    AttchmentsData: any[];
    isRefresh: boolean;
    isOpenArchiveModal: boolean;
    filterHazardValue: any;
    filteredHazardData: any[];
    isHazardQrModelOpen: boolean;
    HazardQRCodeImage: any;
    isHazardSiteUpdate: any;
    isAttachmentModalOpen: any;
    selectedStateId: any;
    selectedHazardItem: any;
}
export const HazardListingData = (props: any) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    // const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : (window.innerWidth <= 768 ? 'card' : 'grid'));
    const currentView = props.view;
    const setCurrentView = props.onViewChange;
    const [isLoading, setIsLoading] = useState(false);
    const tooltipId = useId('tooltip');
    const [columns, setColumns] = useState<any>([]);
    const [isPdfMode, setisPdfMode] = useState(false);
    const [state, setState] = React.useState<IHazardData>({
        HazardData: [],
        AttchmentsData: [],
        isRefresh: false,
        PDFData: [],
        selectedHazardItem: null,
        isOpenArchiveModal: false,
        filterHazardValue: '',
        filteredHazardData: [],
        isHazardQrModelOpen: false,
        HazardQRCodeImage: '',
        isHazardSiteUpdate: false,
        isAttachmentModalOpen: false,
        selectedStateId: []
    });

    const handleOpenHazardQRModal = () => {
        setState((s) => ({ ...s, isHazardQrModelOpen: true }));
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
        props.onViewDetails(itemID.ID);
    };

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { onclickExportToPDF() },
            },
            {
                key: "exportExcel",
                text: "Export to Excel",
                iconProps: { iconName: "ExcelDocument", style: { color: "orange" } },
                onClick: (ev, item) => { onclickExportToExcel() },
            },
        ],
    };

    const onclickExportToPDF = async () => {
        setIsLoading(true);
        setisPdfMode(true);
        // let fileName: string = generatePdfFileName(`${hazardFormDetail?.SiteName?.replace(/\s+/g, '')}_HZ`);
        let fileblob: any = await generateAndSaveKendoHazardPDF("HazardReportPDF", 'Master Hazard Report', false, true, true);
        setisPdfMode(false);
        setIsLoading(false);
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
                key: 'SiteName', name: HazardViewFields.SiteName, fieldName: 'SiteName', isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
                onRender: (item: any) => (
                    <Link className="tooltipcls" onClick={() => onClickView(item)}>
                        {item.SiteName}
                    </Link>
                )
            },
            { key: 'ID', name: HazardViewFields.FormID, fieldName: 'HazardFormId', isResizable: true, minWidth: 120, maxWidth: 150, isSortingRequired: true },
            { key: 'Hazard', name: HazardViewFields.HazardType, fieldName: 'HazardType', isResizable: true, minWidth: 150, maxWidth: 220, isSortingRequired: true },
            { key: 'HazardSubType', name: HazardViewFields.HazardSubType, fieldName: 'HazardSubType', isResizable: true, minWidth: 140, maxWidth: 220, isSortingRequired: true },
            { key: 'SubmittedBy', name: HazardViewFields.SubmittedBy, fieldName: 'SubmittedBy', isResizable: true, minWidth: 150, maxWidth: 210, isSortingRequired: true },
            {
                key: 'SubmittedDate', name: HazardViewFields.SubmissionDate, fieldName: 'SubmissionDateDisplay', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        <div className="badge rounded-pill text-bg-info date-badge">{item?.SubmissionDateDisplay}</div>
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

        const loadAttachments = async () => {
            let attachments = await getHazardFormDataById();
        }
        loadAttachments()
        setColumns(columns);
        setState(prevState => ({
            ...prevState,
            filteredHazardData: props.hazardData,
            PDFData: props.hazardData
        }));

    }, [props.hazardData]);

    const onclickRefreshGrid = () => {
        setState((prev) => ({
            ...prev,
            isRefresh: true
        }));
    };

    const onclickExportToExcel = async () => {
        try {
            const siteName = props?.componentProps?.siteName;
            const fileName = generateExcelFileName(siteName ? `${siteName}-HazardReport` : 'HazardReport')
            let exportColumns: any[] = [
                { header: HazardViewFields.SiteName, key: "SiteName" },
                { header: HazardViewFields.FormID, key: "HazardFormId" },
                { header: HazardViewFields.HazardType, key: "HazardType" },
                { header: HazardViewFields.HazardSubType, key: "HazardSubType" },
                { header: HazardViewFields.SubmittedBy, key: "SubmittedBy" },
                { header: HazardViewFields.SubmissionDate, key: "SubmissionDateDisplay" }
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

    const _onItemSelected = (item: any): void => {
    };


    const onCloseSiteModal = () => {
        setState(prevState => ({
            ...prevState,
            isHazardSiteUpdate: false,
            selectedHazardItem: null
        }));
    }

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    return {
        provider,
        currentUserRoleDetail,
        isLoading,
        currentView,
        state,
        tooltipId,
        columns,
        menuProps,
        isPdfMode,
        onclickRefreshGrid,
        onclickExportToExcel,
        _onItemSelected,
        handleOpenHazardQRModal,
        onCloseSiteModal,
        handleViewChange,
        onClickSiteUpdate,
        onClickUnArchive,
        onClickView,
        setState,
        onClickAttachment,
        props
    }

}