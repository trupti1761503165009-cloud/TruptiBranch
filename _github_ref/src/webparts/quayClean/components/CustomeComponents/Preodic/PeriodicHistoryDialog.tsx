import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { DialogType, IColumn, Link, Panel, PanelType, SelectionMode, TooltipHost } from "@fluentui/react";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getConvertedDate, isWithinNextMonthRange } from "../../../../../Common/Util";
import { IAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import moment from "moment";

export interface IAssetHistoryProps {
    provider: IDataProvider;
    isModelOpen: boolean;
    context: WebPartContext;
    siteName?: string;
    onClickClose(): any;
    handleViewAttachment(item: any): any;
    onClickEditHistory(item: any): any;
    manageComponentView?: any;
    PeriodicId?: any;
    selectedItemForHistory: any;
    historyItems: any;
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
}

export const PeriodicHistoryDialog = (props: IAssetHistoryProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
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
        ddfilter: ""
    });

    const getPeriodicHistoryColumn = (): IColumn[] => {
        let columns: IColumn[] = [
            {
                key: "Id", name: 'Action', fieldName: 'Id', isResizable: true, minWidth: 80, maxWidth: 80,
                onRender: ((item: any) => {
                    return <>
                        <div className='dflex action-wrap'>
                            <Link className="actionBtn btnEdit dticon">
                                <TooltipHost content={"Edit Record"}>
                                    <div onClick={() => props.onClickEditHistory(item)}>
                                        <FontAwesomeIcon icon="pen-to-square" />
                                    </div>
                                </TooltipHost>
                            </Link>
                            {(item?.attachmentFiles && item?.attachmentFiles.length > 0) && <div>
                                <Link
                                    className={`actionBtn btnDanger dticon`}
                                >
                                    <TooltipHost
                                        content={"View Attachments"}
                                        id={"tooltipIdViewAttachments"}
                                    >
                                        <div>
                                            <FontAwesomeIcon
                                                icon="paperclip"
                                                className="cursor-pointer mx-2"
                                                title="View Attachments"
                                                onClick={() =>
                                                    props.handleViewAttachment(item)
                                                }
                                            />
                                        </div>
                                    </TooltipHost>
                                </Link>
                            </div>}
                        </div>
                    </>;
                })
            },
            { key: 'Title', name: 'Periodic', fieldName: 'Title', minWidth: 60, maxWidth: 60 },
            { key: 'Area', name: 'Area', fieldName: 'Area', minWidth: 60, maxWidth: 70 },
            { key: 'Frequency', name: 'Frequency', fieldName: 'Frequency', isResizable: true, minWidth: 80, maxWidth: 100 },
            { key: 'JobCompletion', name: 'Job Completion', fieldName: 'JobCompletion', isResizable: true, minWidth: 140, maxWidth: 180 },
            { key: 'TaskDate', name: 'Task Date', fieldName: 'TaskDate', minWidth: 90, maxWidth: 140 },
            {
                key: 'CompletionDate', name: 'Completion Date', fieldName: 'CompletionDate', minWidth: 110, maxWidth: 160,

                onRender: ((itemID: any) => {
                    const isPastDate = (date: any) => {
                        return moment(date).isBefore(moment());
                    };
                    return <>
                        {(isWithinNextMonthRange(itemID.fullCompletionDate) && itemID.IsCompleted === false && isPastDate(itemID.CompletionDate)) ?
                            <div className="redBadgeact badge-mar-o">{itemID.CompletionDate}</div> : <div className="">{itemID.CompletionDate}</div>
                        }
                    </>;
                })
            },
            { key: 'Comment', name: 'Comment', fieldName: 'Comment', minWidth: 90, maxWidth: 140 },
        ];
        return columns;
    };

    const onClickCloseModel = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const _onItemSelected = (item: any): void => {
    };

    const Detaillist = (column: any, item: any[]) => {
        // setState(prevState => ({ ...prevState, reload: false }));
        return <>
            {isLoading && <Loader />}
            {props?.selectedItemForHistory &&
                <div style={{ padding: "0 8px" }}>
                    <div
                        style={{
                            marginBottom: 20,
                            borderRadius: 6,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            rowGap: "10px",
                            columnGap: "25px"
                        }}
                    >
                        <div>
                            <strong>Periodic Title</strong><br />
                            {props?.selectedItemForHistory?.Title}
                        </div>

                        <div>
                            <strong>Sub Location</strong><br />
                            {props?.selectedItemForHistory?.SubLocation}
                        </div>

                        <div>
                            <strong>Area</strong><br />
                            {props?.selectedItemForHistory?.Area}
                        </div>

                        <div>
                            <strong>Work Type</strong><br />
                            {props?.selectedItemForHistory?.WorkType}
                        </div>
                    </div>
                </div>
            }
            <div className="ms-SPLegacyFabricBlock">
                {
                    <MemoizedDetailList
                        columns={column}
                        items={item || []}
                        reRenderComponent={true}
                        searchable={true}
                        isAddNew={true}
                        onSelectedItem={_onItemSelected}
                        CustomselectionMode={SelectionMode.none}
                        manageComponentView={
                            function (componentProp: IQuayCleanState) {
                                throw new Error("Function not implemented.");
                            }
                        }
                        isAutoHeight={true}
                        // setContainerDefaultheight={600}
                        addNewContent={<div></div>} />
                }
            </div >
        </>;
    };

    React.useEffect(() => {
        setIsLoading(true);
        try {
            void (async () => {
                let column = getPeriodicHistoryColumn();
                let assetitems: any[] = [];
                // let assetHistoryItems = await getPeriodicHistoryitems();
                let assetHistoryItems = props.historyItems;
                if (assetHistoryItems.length > 0) {
                    assetitems = assetHistoryItems.map((item: any) => {
                        return {
                            Id: item.Id,
                            Title: !!item.Title ? item.Title : "",
                            CompletionDate: !!item.CompletionDate ? getConvertedDate(item.CompletionDate) : "",
                            CompletedDate: !!item.Created ? getConvertedDate(item.Created) : "",
                            TaskDate: !!item.TaskDate ? getConvertedDate(item.TaskDate) : "",
                            Manufacturer: !!item.Manufacturer ? item.Manufacturer : "",
                            CompletedBy: !!item.Author ? item.Author.Title : "",
                            Frequency: !!item.Frequency ? item.Frequency : "",
                            JobCompletion: !!item.JobCompletion ? item.JobCompletion : "",
                            TaskDateUpdate: !!item.TaskDate ? item.TaskDate : "",
                            CompletionDateUpdate: !!item.CompletionDate ? item.CompletionDate : "",
                            SiteName: !!item.SiteName ? item.SiteName?.Title : "",
                            SiteNameId: !!item.SiteNameId ? item.SiteNameId : "",
                            Cost: !!item.Cost ? item.Cost : "",
                            Month: !!item.Month ? item.Month : "",
                            QCArea: !!item.Area ? item.Area : "",
                            Area: !!item.Area ? item.Area : "",
                            Week: !!item.Week ? item.Week : "",
                            Year: !!item.Year ? item.Year : "",
                            EventNumber: !!item.EventNumber ? item.EventNumber : "",
                            Hours: !!item.Hours ? item.Hours : "",
                            StaffNumber: !!item.StaffNumber ? item.StaffNumber : "",
                            WorkType: !!item.WorkType ? item.WorkType : "",
                            IsCompleted: !!item.IsCompleted ? item.IsCompleted : false,
                            IsCompletedText: item?.IsCompleted == true ? "Yes" : "No",
                            IsNotification: !!item.IsNotification ? item.IsNotification : false,
                            IsNotificationText: item?.IsNotification == true ? "Yes" : "No",
                            SubLocation: !!item.SubLocation ? item.SubLocation : "",
                            Modified: !!item.Modified ? item.Modified : null,
                            IsArchived: !!item.IsArchived ? item.IsArchived : false,
                            Comment: !!item.Comment ? item.Comment : "",
                            attachmentFiles: item?.AttachmentFiles?.map((a: any) => a.ServerRelativeUrl) || [],
                            IsHistoryId: !!item.IsHistoryId ? item?.IsHistoryId?.Id : undefined,
                        };
                    });
                }
                let detailList = Detaillist(column, assetitems);
                setState(prevState => ({ ...prevState, column: column, detailList: detailList, assetHistoryItems: assetitems }));

            })();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }

        // }, [state.reload]);
    }, [props.historyItems]);

    const onPanelclose = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isPanelOpen: false }));
    };

    return <>
        {isErrorModelOpen && <CustomeDialog closeText="Close" isDialogOpen={isErrorModelOpen} onClickClose={() => { setIsErrorModelOpen(false); }} dialogContentProps={{ type: DialogType.normal, title: 'Something went wrong.', closeButtonAriaLabel: 'Close' }} dialogMessage={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}
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

        <CustomModal
            dialogWidth="950px"
            isModalOpenProps={state.isModelOpen}
            setModalpopUpFalse={onClickCloseModel}
            subject={"Periodic History"}
            message={state.detailList}
            closeButtonText={"Close"} />
    </>;
};