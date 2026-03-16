import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider"; import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { _onItemSelected, isWithinNextMonthRange, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { Breadcrumb, Link, MessageBar, MessageBarType, PrimaryButton, TooltipHost } from "@fluentui/react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import moment from "moment";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
import { useAtomValue } from "jotai";
import AttachmentPopup from "./AttachmentPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getFileType } from "../../CommonComponents/CommonMethods";
// eslint-disable-next-line @typescript-eslint/no-var-requires
export interface IAssetDetailsProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAssetDetails?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    isShowDetailOnly?: boolean;
    preViousCompomentName?: string;
    breadCrumItems: any[];
    componentProp: IQuayCleanState;
    periodicData: any;
    loginUserRoleDetails: any;
    siteMasterId: any;
    dataObj?: any;
}

export const PeriodicDetails = (props: IAssetDetailsProps) => {
    const [dataPeriodic] = React.useState<any>(props.componentProp.periodicData);
    const isCall = React.useRef<boolean>(true);
    const isDue = moment(dataPeriodic.CompletionDate).isBefore(moment());
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [attachmentDialogState, setAttachmentDialogState] = React.useState({
        isOpen: false,
        selectedItem: null
    });
    const onClickClose = () => {
        // if (props?.componentProp?.siteMasterId) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProp.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey"
        //     });
        // } 
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "ManagePeriodicListKey",
            });
        }
        else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({ currentComponentName: ComponentNameEnum.ManagePeriodicList, breadCrumItems: breadCrumItems });
        }
    };

    const getState = (siteNameId: any) => {
        try {
            let queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ["Id", "QCStateId"],
                filter: `Id eq ${siteNameId}`
            };
            return props.provider.getItemsByQuery(queryOptions);
        } catch (error) {
            console.log(error);
        }
        return [];
    };

    const handleViewAttachment = (item: any) => {
        setAttachmentDialogState({
            isOpen: true,
            selectedItem: item,
        })
    }


    const _userActivityLog = async () => {
        try {
            let orgSiteId = dataPeriodic.SiteNameId;
            let data = await getState(orgSiteId);
            if (props?.componentProp?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                let filterSiteNameId = orgSiteId || dataPeriodic?.SiteNameId;
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${dataPeriodic.ID}' and SiteNameId eq '${filterSiteNameId}' and EntityType eq '${UserActionEntityTypeEnum.Periodic}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                        SiteNameId: filterSiteNameId,
                        ActionType: UserActivityActionTypeEnum.DetailsView,
                        Email: currentUserRoleDetail?.emailId,
                        EntityType: UserActionEntityTypeEnum.Periodic,
                        EntityId: dataPeriodic.ID,
                        EntityName: dataPeriodic?.Title,
                        Count: 1,
                        Details: "Details View",
                        StateId: props?.componentProp?.qCStateId || data[0]?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }
                isCall.current = false;
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            // setIsLoading(false);
        }
    };
    React.useEffect(() => {
        if (!!dataPeriodic && dataPeriodic?.Title !== "" && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [dataPeriodic]);


    return <>
        {!!dataPeriodic &&
            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                <div> <h1 className="mainTitle">Periodic Details</h1>
                                    {(isWithinNextMonthRange(dataPeriodic.fullCompletionDate) && dataPeriodic.IsCompleted === false && isDue) &&
                                        <div style={{ width: "275px" }} >
                                            <MessageBar messageBarType={MessageBarType.severeWarning}>
                                                <div className="inputText">Task is Due on: {dataPeriodic.CompletionDate}</div>
                                            </MessageBar>
                                        </div>
                                    }</div>
                                <div className="dFlex">
                                    <div>
                                        <PrimaryButton className="btn btn-danger justifyright floatright"
                                            onClick={onClickClose}
                                            text="Back" />
                                    </div>
                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.breadCrumItems}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <section className="mt-3">
                                    <div className="container-fluid">

                                        <div className="row">
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Area
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.QCArea}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 ">
                                                <label className="viewLabel" >Sub Location </label >
                                                <div className="mt1 listDetail inputText"> {dataPeriodic.SubLocation} </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Work Type
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.WorkType}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 ">
                                                <label className="viewLabel" >Periodic Title</label >
                                                <div className="mt1 listDetail inputText"> {dataPeriodic.Title} </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Frequency
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Frequency}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Week
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Week}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Month
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Month}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Year
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Year}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Job Completion
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.JobCompletion}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Task Date
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.TaskDate}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Completion Date
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.CompletionDate}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Event Number
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.EventNumber}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Hours
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Hours}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Cost
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Cost}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Staff Number
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.StaffNumber}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Completed?
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.IsCompletedText}</div>
                                                </div>
                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Notification?
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.IsNotificationText}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Comment
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{dataPeriodic.Comment || "No Comments added"}</div>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                                <div className="formGroup">
                                                    {dataPeriodic.attachmentFiles && dataPeriodic.attachmentFiles.length > 0 && (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                gap: "8px",
                                                                flexWrap: "wrap",
                                                                cursor: "pointer"
                                                            }}
                                                            onClick={() => handleViewAttachment(dataPeriodic)} // open popup
                                                        >
                                                            {dataPeriodic.attachmentFiles.map((fileUrl: any, idx: number) => {
                                                                const fileType = getFileType(fileUrl);

                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        style={{
                                                                            width: 60,
                                                                            height: 60,
                                                                            cursor: "pointer",
                                                                            border: "1px solid #ccc",
                                                                            borderRadius: 4,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            background: "#f3f2f1",
                                                                            overflow: "hidden"
                                                                        }}
                                                                    >
                                                                        {fileType === "image" ? (
                                                                            <img
                                                                                src={fileUrl}
                                                                                style={{
                                                                                    width: "100%",
                                                                                    height: "100%",
                                                                                    objectFit: "cover"
                                                                                }}
                                                                            />
                                                                        ) : fileType === "pdf" ? (
                                                                            <span style={{ fontSize: 10 }}>PDF</span>
                                                                        ) : (
                                                                            <span style={{ fontSize: 10 }}>{fileType.toUpperCase()}</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12 col-sm-12 col-12 mb-3 textRight">
                                                <PrimaryButton
                                                    style={{ margin: "5px", marginTop: "0px" }}
                                                    className="btn btn-danger"
                                                    text="Back"
                                                    onClick={onClickClose}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
        {attachmentDialogState.isOpen && (
            <AttachmentPopup
                isOpen={attachmentDialogState.isOpen}
                onClose={() =>
                    setAttachmentDialogState(prev => ({
                        ...prev,
                        isOpen: false,
                        selectedItem: null
                    }))
                }
                selectedItem={attachmentDialogState.selectedItem}
            />
        )}
    </>;
};

