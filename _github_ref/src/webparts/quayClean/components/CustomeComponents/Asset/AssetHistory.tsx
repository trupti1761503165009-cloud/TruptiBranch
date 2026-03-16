import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { IColumn, IDetailsHeaderProps, IRenderFunction, Link, Panel, PanelType, SelectionMode, ShimmeredDetailsList, Sticky, StickyPositionType, TooltipHost } from "@fluentui/react";

import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getConvertedDate, logGenerator, onDetailListHeaderRender } from "../../../../../Common/Util";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { IAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "@fluentui/react-hooks";
import { PrimaryButton } from "office-ui-fabric-react";
import { MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
export interface IAssetHistoryProps {
    provider: IDataProvider;
    siteNameId: number;
    isModelOpen: boolean;
    context: WebPartContext;
    onClickClose(): any;
    SiteURL?: string;
    assetMasterId: number;
    IsSupervisor?: boolean;

}
export interface IAssetHistoryState {
    isModelOpen: boolean;
    column: IColumn[];
    detailList: any;
    assetHistoryItems: IAssetHistory[];
    isPanelOpen: boolean;
    url: string;

}

export const AssetHistory = (props: IAssetHistoryProps) => {
    const [state, setState] = React.useState<IAssetHistoryState>({
        isModelOpen: props.isModelOpen,
        column: [],
        detailList: null,
        assetHistoryItems: [],
        isPanelOpen: false,
        url: ""
    });
    const tooltipId = useId('tooltip');
    const getassetHistoryitems = () => {
        let queryOptions: IPnPQueryOptions = {
            listName: ListNames.AssetHistory,
            filter: `AssetMasterId eq ${props.assetMasterId}`,
            select: ['Id,Title,ServiceDate,SiteNameId,ServiceUpdatedBy,AttachmentFiles,Attachments'],
            expand: ['AttachmentFiles']
        };
        return props.provider.getItemsByQuery(queryOptions);
    };

    const assetHistoryColumn = (): IColumn[] => {
        let columns: IColumn[] = [
            { key: 'serviceDate', name: 'Service Date', fieldName: 'serviceDate', minWidth: 80, maxWidth: 100 },
            { key: 'serviceComplatedBy', name: 'Service Updated By', fieldName: 'ServiceUpdatedBy', minWidth: 120, maxWidth: 150 },
            {
                key: 'attachment', name: 'Attachment', fieldName: '', minWidth: 30, maxWidth: 50,
                onRender: ((item: any) => {
                    if (item.url != '' && item.url2 != '') {
                        return <>
                            <div className='dflex'>
                                <Link className="actionBtn btnView dticon" onClick={() => {
                                    setState(prevState => ({ ...prevState, url: item.url2, isPanelOpen: true }));

                                }}>
                                    <TooltipHost
                                        content={"View Attachment"}
                                        id={tooltipId}>
                                        <FontAwesomeIcon icon="eye" />
                                    </TooltipHost>
                                </Link>
                                <Link className="actionBtn btnDanger dticon" onClick={() => {
                                    setState(prevState => ({ ...prevState, url: item.url, isPanelOpen: true }));
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
                                        setState(prevState => ({ ...prevState, url: item.url, isPanelOpen: true }));
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
                                        setState(prevState => ({ ...prevState, url: item.url2, isPanelOpen: true }));
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
        ];

        return columns;
    };

    const Detaillist = (column: any, items: IAssetHistory[]) => {
        return <>
            {items.length > 0 ?
                <ShimmeredDetailsList
                    items={items}
                    columns={column}
                    onRenderDetailsHeader={(detailsHeaderProps: IDetailsHeaderProps, defaultRender: IRenderFunction<IDetailsHeaderProps>) =>
                    (<Sticky stickyPosition={StickyPositionType.Header}>
                        {onDetailListHeaderRender(detailsHeaderProps, defaultRender)}
                    </Sticky>)}
                    selectionMode={SelectionMode.none}
                /> :
                <NoRecordFound />
            }
        </>;

    };

    React.useEffect(() => {

        try {
            void (async () => {
                let column = assetHistoryColumn();
                let assetitems: IAssetHistory[] = [];
                let assetHistoryItems = await getassetHistoryitems();
                if (assetHistoryItems.length > 0) {
                    assetitems = assetHistoryItems.map((item: any) => {
                        let link: any = "";
                        let link2: any = "";
                        let DocumentFullPath = "";
                        let DocumentFullPath2 = "";
                        let matchingAttachments = [];
                        let nonMatchingAttachments = [];
                        let fileNamePattern = /Invoice/;
                        matchingAttachments = item.AttachmentFiles?.filter((attachment: any) => fileNamePattern.test(attachment.FileName));
                        nonMatchingAttachments = item.AttachmentFiles?.filter((attachment: any) => !fileNamePattern.test(attachment.FileName));
                        if (matchingAttachments.length > 0) {

                            let InvoiceAttachment = [];
                            InvoiceAttachment = matchingAttachments[0];
                            link = props.context.pageContext.web.absoluteUrl + '/Lists' + InvoiceAttachment.ServerRelativeUrl.split('Lists')[1];
                            let filePath: string = `${link}`;

                            let embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${link}&action=embedview`;
                            let fileType = filePath.split('.').pop();
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
                            link2 = props.context.pageContext.web.absoluteUrl + '/Lists' + nonInvoiceAttachment.ServerRelativeUrl.split('Lists')[1];
                            let filePath2: string = `${link2}`;

                            let embedFullFilePath2 = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${link2}&action=embedview`;
                            let fileType2 = filePath2.split('.').pop();
                            if (MicrosoftOfficeDocumentType.indexOf(fileType2 || '') >= 0)
                                DocumentFullPath2 = embedFullFilePath2;
                            else
                                DocumentFullPath2 = (fileType2 === "zip" ? `${filePath2}?web = 1 & action=embedview` : filePath2);

                        } else {
                            DocumentFullPath2 = "";
                        }

                        return {
                            id: item.Id,
                            title: !!item.Title ? item.Title : "",
                            serviceDate: !!item.ServiceDate ? getConvertedDate(item.ServiceDate) : "",
                            siteNameId: !!item.SiteNameId ? item.SiteNameId : 0,
                            // serviceCompleteById: !!item.ServiceCompleteById ? item.ServiceCompleteById : 0,
                            // serviceCompleteByTitle: !!item.ServiceCompleteById ? item.ServiceCompleteBy.Title : "",
                            // serviceCompleteByEmail: !!item.ServiceCompleteById ? item.ServiceCompleteBy.EMail : "",
                            ServiceUpdatedBy: !!item.ServiceUpdatedBy ? item.ServiceUpdatedBy : "",
                            attachments: item.Attachments,
                            serverRelativeUrl: item.Attachments ? item.AttachmentFiles[0].ServerRelativeUrl : "",
                            url: DocumentFullPath ? DocumentFullPath : "",
                            url2: DocumentFullPath2 ? DocumentFullPath2 : ""
                        };
                    });
                }
                let detailList = Detaillist(column, assetitems);
                setState(prevState => ({ ...prevState, column: column, detailList: detailList, assetHistoryItems: assetitems }));
            })();


        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in useEffect  ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project  Asset histroy "
            };
            console.log(errorObj);
            void logGenerator(props.provider, errorObj);
        }

    }, []);

    const onClickCloseModel = () => {
        props.onClickClose();

        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };
    const onPanelclose = () => {
        props.onClickClose();

        setState(prevState => ({ ...prevState, isPanelOpen: false }));
    };
    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onPanelclose} text="Close" />
        </div>;
    };

    return <>
        <Panel
            isOpen={state.isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.extraLarge}
            onRenderFooterContent={onRenderFooterContent}
        >
            <iframe
                src={state.url}
                style={{ width: "100%", height: "75vh" }}
            />

        </Panel>
        <CustomModal dialogWidth="700px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Service History"} message={state.detailList} closeButtonText={"Close"} isBlocking={true}
            isModeless={false} />
    </>;

};