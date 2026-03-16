/* eslint-disable react/jsx-key */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Loader } from "../../CommonComponents/Loader";
import axios from "axios";
import moment from "moment";
import { APISiteLink, ActionPriority } from "../../../../../Common/Constants/CommonConstants";
import { IDocumnetState } from "../AuditReport/Documnet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Panel, PanelType, Link, TooltipHost, PrimaryButton, DefaultButton, DialogFooter, FocusTrapZone, Overlay, Popup } from "office-ui-fabric-react";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { ViewActionFilter } from "../../../../../Common/Filter/ViewAction";
import { getErrorMessage, getErrorMessageValue, logGenerator } from "../../../../../Common/Util";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { Layer, mergeStyleSets } from "@fluentui/react";

interface IActionFilterProps {
    provider: IDataProvider;
    siteName: any;
}

export const ActionView: React.FunctionComponent<IActionFilterProps> = (props: IActionFilterProps): React.ReactElement => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [apierror, setapierror] = React.useState<boolean>(false);
    const [ActionData, setActionData] = React.useState<any[]>([]);
    const [selectedViewAction, setSelectedViewAction] = React.useState<any>("List View");
    const [isViewCard, setIsViewCard] = React.useState<boolean>(false);
    const ActionItem = React.useRef<any>();
    const ActionLink = React.useRef<any>("");
    const [linkFound, setlinkFound] = React.useState<boolean>(true);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [width, setwidth] = React.useState<any>("400px");
    const [state, setState] = React.useState<IDocumnetState>({
        column: [],
        documentItem: [],
        isDocumentPanelOpen: false,
        isDocumentPanelActionOpen: false,
        documnetUrl: "",
        isRelod: false
    });

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setwidth("90%")
        } else {
            setwidth("400px")
        }
    }, []);

    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '400px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const onClick_ActionData = async (data: any) => {
        ActionItem.current = data;
        if (!!data && data?.fullinspectionId !== null && data?.fullinspectionId !== "" && data?.fullinspectionId !== undefined) {
            // setState(prevState => ({ ...prevState, isDocumentPanelActionOpen: true }));
            try {
                setIsLoading(true);
                const taskdata = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/GetInspectionWebReportLink?InspectionId=${data.fullinspectionId}`);
                if (taskdata) {
                    ActionLink.current = taskdata.data.url;
                } else {
                    ActionLink.current = "";
                }
                setlinkFound(true);
                setIsLoading(false);
                setState(prevState => ({ ...prevState, isDocumentPanelActionOpen: true })); // Move setState inside the try block
                return taskdata?.data;

            } catch (error) {
                setIsLoading(false);
                console.log('Error fetching data from API:', error);
                if (error?.response?.status == "404") {
                    setlinkFound(false);
                } else {
                    setlinkFound(true);
                }
                setState(prevState => ({ ...prevState, isDocumentPanelActionOpen: true })); // Ensure setState is also called in the catch block
            }
        } else {
            ActionLink.current = "Not Found";
            setlinkFound(true);
            setState(prevState => ({ ...prevState, isDocumentPanelActionOpen: true }));
            // showPopup();
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

    const fetchDataFromAPI = async () => {
        try {
            const response = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/GetListActions?SiteName=${encodeURIComponent(props.siteName)}`);
            return response?.data;
            setapierror(false);
        } catch (error) {
            if (props.siteName) {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            }
            console.log('Error fetching data from API:', error);
            if (error?.response?.data?.Message == "Site ID is required. Site Not Found!") {
                setapierror(true);
            }
        }
    };

    const onClickClose = () => {
        setState(prevState => ({ ...prevState, isDocumentPanelOpen: false, isDocumentPanelActionOpen: false }));
    };

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
        </div>;
    };

    React.useEffect(() => {
        try {

            setIsLoading(true);
            const getPriorityName = (priorityId: string): string => {
                switch (priorityId) {
                    case ActionPriority.None:
                        return "None";
                    case ActionPriority.Low:
                        return "Low";
                    case ActionPriority.Medium:
                        return "Medium";
                    case ActionPriority.High:
                        return "High";
                    default:
                        return "Unknown";
                }
            };
            const fetchData = async () => {
                try {
                    // const responseData1 = await fetchDataFromIssueAPI();
                    const responseData = await fetchDataFromAPI();
                    if (responseData?.actions.length > 0) {
                        const transformedTasks: any = responseData?.actions?.map((taskData: any) => ({
                            creatorName: " Created by " + taskData.task.creator.firstname + " " + taskData.task.creator.lastname,
                            dueAt: moment(taskData.task.due_at).format("D MMM YYYY"),
                            dueAtFull: moment(taskData.task.due_at).format("D MMM YYYY h:mm A"),
                            priorityId: taskData.task.priority_id,
                            priority: getPriorityName(taskData.task.priority_id),
                            siteName: taskData.task.site.name,
                            statusLabel: taskData.task.status.label,
                            uniqueId: taskData.task.unique_id,
                            title: taskData.task.title,
                            asset: taskData.task.asset,
                            taskId: taskData.task.task_id,
                            actionLabel: taskData.task.action_label,
                            inspectionId: taskData.task.inspection.inspection_id.replace(/-/g, ''),
                            fullinspectionId: taskData.task.inspection.inspection_id,
                            inspectionName: taskData.task.inspection.inspection_name,
                            modifiedAt: moment(taskData.task.modified_at).format("D MMMM YYYY"),
                            // userName: " Assigned to " + taskData.task.collaborators[0].user.firstname + " " + taskData.task.collaborators[0].user.lastname,
                            // simpleuserName: taskData.task.collaborators[0].user.firstname + " " + taskData.task.collaborators[0].user.lastname,
                            // sortUserName: (taskData.task.collaborators[0].user.firstname + " " + taskData.task.collaborators[0].user.lastname).split(' ').map(word => word.charAt(0).toUpperCase()).join(''),
                            userName: "Assigned to " + taskData.task.collaborators.map((collab: any) => collab.user.firstname + " " + collab.user.lastname).join(', '),
                            simpleuserName: taskData.task.collaborators.map((collab: any) => collab.user.firstname + " " + collab.user.lastname).join(', '),
                            sortUserName: taskData.task.collaborators.map((collab: any) => collab.user.firstname + " " + collab.user.lastname)
                                .join(', ')
                                .split(' ')
                                .map((word: any) => word.charAt(0).toUpperCase())
                                .join(''),
                        }));
                        setActionData(transformedTasks);
                    }
                    setIsLoading(false);
                    setTimeout(() => {

                    }, 100);
                } catch (error) {
                    setIsLoading(false);
                    const errorObj = { ErrorMethodName: "useEffect", CustomErrormessage: "error in useEffect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                    void logGenerator(props.provider, errorObj);
                    // const _error = getErrorMessage(error);
                    const errorMessage = getErrorMessageValue(error.message);
                    setError(errorMessage);
                    sethasError(true);
                } finally {

                }
            };

            fetchData();
        } catch (error) {
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "useEffect", CustomErrormessage: "error in useEffect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            // const _error = getErrorMessage(error);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    }, [isRefreshGrid]);

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const onClickOkay = () => {
        hidePopup();
    };

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}

            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Warning</h2>
                                <div className="mt-3">
                                    Inspection details not found.
                                </div>
                                <DialogFooter>
                                    <DefaultButton text="Okay" className='secondMain btn btn-danger' onClick={onClickOkay} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>)
            }

            {state.isDocumentPanelActionOpen &&
                <Panel
                    isOpen={state.isDocumentPanelActionOpen}
                    onDismiss={onClickClose}
                    type={PanelType.medium}
                    headerText="Action Details"
                    onRenderFooterContent={onRenderFooterContent}
                >
                    <div className="dflex mt-3 align-items-center">
                        <div className="actlbl">Action</div>
                        <div className="badge badge-secondary mla">{ActionItem.current.uniqueId}</div>
                    </div>
                    <h2 className="mt-3">{ActionItem.current.title}</h2>

                    <table className="mt-2">
                        <tbody>
                            <tr className="mt-3">
                                {ActionItem.current.statusLabel == "To Do" && <td className="actlbl"> <span className="skybluetext badge badge-secondary pad-act-5 actmlm1">{ActionItem.current.statusLabel}</span></td>}
                                {ActionItem.current.statusLabel == "Complete" && <td className="actlbl"> <span className="greentext badge badge-secondary pad-act-5 actmlm1">{ActionItem.current.statusLabel}</span></td>}
                                {ActionItem.current.statusLabel == "In Progress" && <td className="actlbl"> <span className="yellowtext badge badge-secondary pad-act-5 actmlm1">{ActionItem.current.statusLabel}</span></td>}
                                {ActionItem.current.statusLabel == "Pending" && <td className="actlbl"> <span className="redtext badge badge-secondary pad-act-5 actmlm1">{ActionItem.current.statusLabel}</span></td>}
                            </tr>
                            <tr className="mt-4">
                                <td className="actlbl">Priority</td>
                                <td className="padleft">
                                    {ActionItem.current.priority == "Low" && <div className="icgreentext badge-mar-o"><FontAwesomeIcon className="act-ic-mar" icon="angle-down" /><span className="ml2act">{ActionItem.current.priority}</span></div>}
                                    {ActionItem.current.priority == "Medium" && <div className="icyellowtext badge-mar-o"><FontAwesomeIcon className="act-ic-mar" icon="angle-up" /><span className="ml2act">{ActionItem.current.priority}</span></div>}
                                    {ActionItem.current.priority == "High" && <div className="icredtext badge-mar-o"><FontAwesomeIcon className="act-ic-mar" icon="angles-up" /><span className="ml2act">{ActionItem.current.priority}</span></div>}
                                </td>
                            </tr>
                            <tr className="mt-3">
                                <td className="actlbl">Due Date</td>
                                <td className="padleft"><span className="actmr3"><FontAwesomeIcon className="" icon="calendar-days" /></span>{ActionItem.current.dueAtFull}</td>
                            </tr>
                            <tr className="mt-3">
                                <td className="actlbl">Assignees</td>
                                <td className="padleft"><span className="actmr3"><FontAwesomeIcon className="" icon="user" /></span>{ActionItem.current.simpleuserName}</td>
                            </tr>
                            <tr className="mt-3">
                                <td className="actlbl">Site</td>
                                <td className="padleft"><span className="actmr3"><FontAwesomeIcon className="" icon="building" /></span>{ActionItem.current.siteName}</td>
                            </tr>
                            <tr className="mt-3">
                                <td className="actlbl">Asset</td>
                                <td className="padleft">
                                    {(ActionItem.current.asset == "" || ActionItem.current.asset == null) ? <div className="greytext"><span className="actmr3"><FontAwesomeIcon className="" icon="cube" /></span>Add asset</div> : <div><span className="actmr3"><FontAwesomeIcon className="" icon="cube" /></span>{ActionItem.current.asset}</div>}
                                </td>
                            </tr>
                            <tr className="mt-3">
                                <td className="actlbl">Label</td>
                                <td className="padleft">
                                    {(ActionItem.current.actionLabel == null || ActionItem.current.actionLabel.length === 0) ? (
                                        <div className="greytext">
                                            <span className="actmr3"><FontAwesomeIcon className="" icon="tag" /></span>Add label
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="actmr3"><FontAwesomeIcon className="" icon="tag" /></span>
                                            {ActionItem.current.actionLabel.map((label: any) => label?.label_name).join(', ')}
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {!!ActionLink?.current && ActionLink?.current !== "Not Found" &&
                                <tr className="mt-3">
                                    <td className="actlbl">Links</td>
                                </tr>}
                        </tbody>
                    </table>
                    {!!ActionLink?.current && ActionLink?.current !== "Not Found" &&
                        <div className="card-Action2">
                            <div className="cardHeader-Action2">
                                <h3>Link To:
                                    {linkFound === true &&
                                        <Link className="mr-10" target="_blank" onClick={() => {
                                            const url = `${ActionLink?.current}`;
                                            // const url = `https://app.safetyculture.com/report/audit/audit_${ActionItem.current.inspectionId}`;
                                            if (url) {
                                                window.open(url, '_blank');
                                            }
                                        }}>
                                            <TooltipHost content={"Visit Link)"}>
                                                {ActionItem.current?.inspectionName !== "" ?
                                                    <span className="act-ins-clr linkToML">{ActionItem.current?.inspectionName}</span> :
                                                    <span className="act-ins-clr linkToML"> View Form</span>}
                                            </TooltipHost>
                                        </Link>}
                                </h3>
                            </div>
                            <div className="cardBody-Action-Panel2">
                            </div>
                        </div>}
                    <div className="mt-3">{ActionItem.current.creatorName} on {ActionItem.current.dueAtFull}</div>

                    <div className="mt-2"><FontAwesomeIcon className="" icon="eye" /> Visible to anyone who has access to the relevant inspection</div>
                </Panel >
            }

            <div className='card-box-new mb30 '>
                <div className="cls-viewaction-filter">
                    <Link className="actionBtn iconSize btnRefresh actions-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                        text="">
                        <TooltipHost
                            content={"Refresh Grid"}
                            id={tooltipId}
                        >
                            <FontAwesomeIcon
                                icon={"arrows-rotate"}
                            />
                        </TooltipHost>    </Link>
                    {!!ActionData && ActionData.length > 0 &&
                        <ViewActionFilter
                            selectedViewAction={selectedViewAction}
                            onViewActionChange={onViewActionChange}
                            provider={props.provider}
                            defaultOption={selectedViewAction}
                            isRequired={true}
                            AllOption={true}
                        />}
                </div>
                <div className="ms-Grid-row justify-content-start">
                    <div className="ms-Grid-row justify-content-start">
                        {isViewCard === false &&
                            <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid">
                                {!!ActionData && ActionData.length > 0 &&
                                    <div className="card-Action-New">
                                        {ActionData.length > 0 && ActionData.map((e1, i1) => {
                                            return (
                                                <div className="cardHeader-Action" onClick={() => onClick_ActionData(e1)}>
                                                    <h3>{e1.title}</h3>
                                                    <div className="dflex alignItemsCenter gap15 mt-2 fs-14">
                                                        <div className="badge badge-secondary">{e1.uniqueId}</div>
                                                        {e1.priority == "Low" && <div className="greenBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-down" /></span>{e1.priority}</div>}
                                                        {e1.priority == "Medium" && <div className="yellowBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-up" /></span>{e1.priority}</div>}
                                                        {e1.priority == "High" && <div className="redBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angles-up" /></span>{e1.priority}</div>}
                                                        <div className="fs-14 dflex alignItemsCenter">
                                                            <svg className="svg-inline--fa fa-calendar-days text-primary me-2"
                                                                aria-hidden="true" focusable="false" data-prefix="far"
                                                                data-icon="calendar-days" role="img" xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 448 512" data-fa-i2svg="">
                                                                <path fill="currentColor"
                                                                    d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z">
                                                                </path>
                                                            </svg><span className="fw-semibold"></span>
                                                            <div className="mld3">Due {e1.dueAt}</div></div>

                                                        <div className="fs-14 dflex alignItemsCenter gap3"><svg className="dflex alignItemsCenter gap3 bi bi-people-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                                                        </svg> <span className="mld3">{e1.userName ? e1.userName : e1.creatorName}</span></div>
                                                        <div className="dflex alignItemsCenter gap3"><svg className="svg-inline--fa bi bi-building" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                            <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                                                        </svg> {e1.siteName}</div>
                                                        <span className="mla">updated {e1.modifiedAt}</span>
                                                        {e1.statusLabel == "To Do" && <span className="skybluetext">{e1.statusLabel}</span>}
                                                        {e1.statusLabel == "Complete" && <span className="greentext">{e1.statusLabel}</span>}
                                                        {e1.statusLabel == "In Progress" && <span className="yellowtext">{e1.statusLabel}</span>}
                                                        {e1.statusLabel == "Pending" && <span className="redtext">{e1.statusLabel}</span>}
                                                    </div>
                                                </div>);
                                        })}
                                    </div>}
                                {/* {apierror &&
                                    <div className='noRecordFound'>
                                        <span >This Site name is not found in Safety Culture.</span>
                                    </div>}
                                {ActionData.length == 0 && apierror == false &&
                                    <NoRecordFound />
                                } */}


                                {window.innerWidth > 768 &&
                                    <div className="issue-not-found">
                                        {apierror &&
                                            <div className='noRecordFound'>
                                                <span >This Site name is not found in Safety Culture.</span>
                                            </div>}
                                        {ActionData.length == 0 && apierror == false &&
                                            <NoRecordFound />
                                        }
                                    </div>
                                }
                                {window.innerWidth <= 768 &&
                                    <div className="issue-not-found-mob">
                                        {apierror &&
                                            <div className='noRecordFound'>
                                                <span >This Site name is not found in Safety Culture.</span>
                                            </div>}
                                        {ActionData.length == 0 && apierror == false &&
                                            <NoRecordFound />
                                        }
                                    </div>
                                }
                            </div>
                        }
                        {isViewCard === true &&
                            <>
                                <div id="" className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 dialog-grid">
                                    <h2 className="iss-header">To do</h2>
                                    <div className="card-Action2 borrad">
                                        {!!ActionData && ActionData.length > 0 &&
                                            <div className="cardHeader-Action2">

                                                {ActionData.filter(r => r.statusLabel == "To Do").length > 0 ? ActionData.filter(r => r.statusLabel == "To Do")?.map((e2: any, i2: any) => {
                                                    if (e2.statusLabel == "To Do")
                                                        return (
                                                            <div className="card-Action2 borrad">
                                                                <div className="cardBody-Action2">
                                                                    <div className="dflex align-items-center">
                                                                        <div className="actlbl act-ins-clr">Action</div>
                                                                        <div className="badge badge-secondary mla">{e2.uniqueId}</div>
                                                                    </div>
                                                                    <h3 className="mt-1 clsTitle-height">{e2.title}</h3>
                                                                    <div className="dflex alignItemsCenter gap10 mt-3 fs-14">
                                                                        <div className="badge badge-secondary">{e2.sortUserName}</div>
                                                                        {e2.priority == "Low" && <div className="greenBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-down" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "Medium" && <div className="yellowBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-up" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "High" && <div className="redBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angles-up" /></span>{e2.priority}</div>}
                                                                        <div className="fs-14 dflex alignItemsCenter">
                                                                            <svg className="svg-inline--fa fa-calendar-days text-primary me-2"
                                                                                aria-hidden="true" focusable="false" data-prefix="far"
                                                                                data-icon="calendar-days" role="img" xmlns="http://www.w3.org/2000/svg"
                                                                                viewBox="0 0 448 512" data-fa-i2svg="">
                                                                                <path fill="currentColor"
                                                                                    d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z">
                                                                                </path>
                                                                            </svg><span className="fw-semibold"></span>
                                                                            <div className="mld3">{e2.dueAt}</div></div>
                                                                    </div>
                                                                    <div className="dflex alignItemsCenter gap3 issml3 mt-2"><svg className="svg-inline--fa bi bi-building" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                                                                    </svg><span className="act-ins-clr">{e2.siteName}</span></div>
                                                                </div>
                                                            </div>
                                                        );
                                                })
                                                    : <div className="card-Action2 borrad">
                                                        <div className="cardBody-Action2">
                                                            <div className="act-NRF">No records found!</div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div id="" className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 dialog-grid">
                                    <h2 className="iss-header">In Progress</h2>
                                    <div className="card-Action2 borrad">
                                        {!!ActionData && ActionData.length > 0 &&
                                            <div className="cardHeader-Action2">

                                                {ActionData.filter(r => r.statusLabel == "In Progress").length > 0 ? ActionData.filter(r => r.statusLabel == "In Progress")?.map((e2: any, i2: any) => {
                                                    if (e2.statusLabel == "In Progress")
                                                        return (
                                                            <div className="card-Action2 borrad">
                                                                <div className="cardBody-Action2">
                                                                    <div className="dflex align-items-center">
                                                                        <div className="actlbl act-ins-clr">Action</div>
                                                                        <div className="badge badge-secondary mla">{e2.uniqueId}</div>
                                                                    </div>
                                                                    <h3 className="mt-1 clsTitle-height">{e2.title}</h3>
                                                                    <div className="dflex alignItemsCenter gap10 mt-3 fs-14">
                                                                        <div className="badge badge-secondary">{e2.sortUserName}</div>
                                                                        {e2.priority == "Low" && <div className="greenBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-down" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "Medium" && <div className="yellowBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-up" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "High" && <div className="redBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angles-up" /></span>{e2.priority}</div>}
                                                                        <div className="fs-14 dflex alignItemsCenter">
                                                                            <svg className="svg-inline--fa fa-calendar-days text-primary me-2"
                                                                                aria-hidden="true" focusable="false" data-prefix="far"
                                                                                data-icon="calendar-days" role="img" xmlns="http://www.w3.org/2000/svg"
                                                                                viewBox="0 0 448 512" data-fa-i2svg="">
                                                                                <path fill="currentColor"
                                                                                    d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z">
                                                                                </path>
                                                                            </svg><span className="fw-semibold"></span>
                                                                            <div className="mld3">{e2.dueAt}</div></div>
                                                                    </div>
                                                                    <div className="dflex alignItemsCenter gap3 issml3 mt-2"><svg className="svg-inline--fa bi bi-building" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                                                                    </svg><span className="act-ins-clr">{e2.siteName}</span></div>
                                                                </div>
                                                            </div>
                                                        );
                                                })
                                                    : <div className="card-Action2 borrad">
                                                        <div className="cardBody-Action2">
                                                            <div className="act-NRF">No records found!</div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div id="" className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 dialog-grid">
                                    <h2 className="iss-header">Complete</h2>
                                    <div className="card-Action2 borrad">
                                        {!!ActionData && ActionData.length > 0 &&
                                            <div className="cardHeader-Action2">

                                                {ActionData.filter(r => r.statusLabel == "Complete").length > 0 ? ActionData.filter(r => r.statusLabel == "Complete")?.map((e2: any, i2: any) => {
                                                    if (e2.statusLabel == "Complete")
                                                        return (
                                                            <div className="card-Action2 borrad">
                                                                <div className="cardBody-Action2">
                                                                    <div className="dflex align-items-center">
                                                                        <div className="actlbl act-ins-clr">Action</div>
                                                                        <div className="badge badge-secondary mla">{e2.uniqueId}</div>
                                                                    </div>
                                                                    <h3 className="mt-1 clsTitle-height">{e2.title}</h3>
                                                                    <div className="dflex alignItemsCenter gap10 mt-3 fs-14">
                                                                        <div className="badge badge-secondary">{e2.sortUserName}</div>
                                                                        {e2.priority == "Low" && <div className="greenBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-down" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "Medium" && <div className="yellowBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-up" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "High" && <div className="redBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angles-up" /></span>{e2.priority}</div>}
                                                                        <div className="fs-14 dflex alignItemsCenter">
                                                                            <svg className="svg-inline--fa fa-calendar-days text-primary me-2"
                                                                                aria-hidden="true" focusable="false" data-prefix="far"
                                                                                data-icon="calendar-days" role="img" xmlns="http://www.w3.org/2000/svg"
                                                                                viewBox="0 0 448 512" data-fa-i2svg="">
                                                                                <path fill="currentColor"
                                                                                    d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z">
                                                                                </path>
                                                                            </svg><span className="fw-semibold"></span>
                                                                            <div className="mld3">{e2.dueAt}</div></div>
                                                                    </div>
                                                                    <div className="dflex alignItemsCenter gap3 issml3 mt-2"><svg className="svg-inline--fa bi bi-building" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                                                                    </svg><span className="act-ins-clr">{e2.siteName}</span></div>
                                                                </div>
                                                            </div>
                                                        );
                                                })
                                                    : <div className="card-Action2 borrad">
                                                        <div className="cardBody-Action2">
                                                            <div className="act-NRF">No records found!</div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div id="" className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 dialog-grid">
                                    <h2 className="iss-header">Can't do</h2>
                                    <div className="card-Action2 borrad">
                                        {!!ActionData && ActionData.length > 0 &&
                                            <div className="cardHeader-Action2">

                                                {ActionData.filter(r => r.statusLabel == "Pending").length > 0 ? ActionData.filter(r => r.statusLabel == "Pending")?.map((e2: any, i2: any) => {
                                                    if (e2.statusLabel == "Pending")
                                                        return (
                                                            <div className="card-Action2 borrad">
                                                                <div className="cardBody-Action2">
                                                                    <div className="dflex align-items-center">
                                                                        <div className="actlbl act-ins-clr">Action</div>
                                                                        <div className="badge badge-secondary mla">{e2.uniqueId}</div>
                                                                    </div>
                                                                    <h3 className="mt-1 clsTitle-height">{e2.title}</h3>
                                                                    <div className="dflex alignItemsCenter gap10 mt-3 fs-14">
                                                                        <div className="badge badge-secondary">{e2.sortUserName}</div>
                                                                        {e2.priority == "Low" && <div className="greenBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-down" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "Medium" && <div className="yellowBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-up" /></span>{e2.priority}</div>}
                                                                        {e2.priority == "High" && <div className="redBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angles-up" /></span>{e2.priority}</div>}
                                                                        <div className="fs-14 dflex alignItemsCenter">
                                                                            <svg className="svg-inline--fa fa-calendar-days text-primary me-2"
                                                                                aria-hidden="true" focusable="false" data-prefix="far"
                                                                                data-icon="calendar-days" role="img" xmlns="http://www.w3.org/2000/svg"
                                                                                viewBox="0 0 448 512" data-fa-i2svg="">
                                                                                <path fill="currentColor"
                                                                                    d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z">
                                                                                </path>
                                                                            </svg><span className="fw-semibold"></span>
                                                                            <div className="mld3">{e2.dueAt}</div></div>
                                                                    </div>
                                                                    <div className="dflex alignItemsCenter gap3 issml3 mt-2"><svg className="svg-inline--fa bi bi-building" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                                                                    </svg><span className="act-ins-clr">{e2.siteName}</span></div>
                                                                </div>
                                                            </div>
                                                        );
                                                })
                                                    : <div className="card-Action2 borrad">
                                                        <div className="cardBody-Action2">
                                                            <div className="act-NRF">No records found!</div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>;
    }
};