/* eslint-disable react/jsx-key */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { APISiteLink, ActionPriority } from "../../../../../Common/Constants/CommonConstants";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { Loader } from "../../CommonComponents/Loader";
import moment from "moment";
import { logGenerator, getErrorMessage, getErrorMessageValue } from "../../../../../Common/Util";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { useId } from "@fluentui/react-hooks";
import { Link, TooltipHost } from "office-ui-fabric-react";
interface IIssueFilterProps {
    provider: IDataProvider;
    siteName: any;
}

export const IssueView: React.FunctionComponent<IIssueFilterProps> = (props: IIssueFilterProps): React.ReactElement => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const ActionItem = React.useRef<any>();
    const [isViewCard, setIsViewCard] = React.useState<boolean>(false);
    const [linkFound, setlinkFound] = React.useState<boolean>(true);
    const [IssueData, setIssueData] = React.useState<any[]>([]);
    const [apiissueerror, setapiissueerror] = React.useState<boolean>(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const onClick_IssueData = async (data: any) => {
        ActionItem.current = data;

        const url = `${APISiteLink.SafetyCulture}/api/SafetyCulture/GetIssueWebReportLinkByTaskId?TaskId=${data.taskId}`;
        try {
            const taskdata = await axios.get(url);
            if (taskdata) {
                window.open(taskdata.data.url, '_blank');
            }
            setlinkFound(true);
            return taskdata?.data;

        } catch (error) {
            setIsLoading(false);
            console.log('Error fetching data from API:', error);
            if (error.response.status == "404") {
                setlinkFound(false);
            } else {
                setlinkFound(true);
            }
        }
    };

    const fetchDataFromIssueAPI = async () => {
        try {
            const response = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/GetIssues?SiteName=${props.siteName}`);
            return response?.data;
            setapiissueerror(false);
        } catch (error) {
            setIsLoading(false);
            console.log('Error fetching data from API:', error);
            if (error?.response?.data?.Message == "Site ID is required. Site Not Found!") {
                setapiissueerror(true);
            }
        }
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    React.useEffect(() => {
        try {
            setIsLoading(true);
            // setIsLoading(true);
            const getStatusName = (priorityId: string): string => {
                switch (priorityId) {
                    case ActionPriority.None:
                        return "None";
                    case ActionPriority.Low:
                        return "Low";
                    case ActionPriority.Medium:
                        return "Medium";
                    case ActionPriority.High:
                        return "High";
                    case ActionPriority.Resolved:
                        return "Resolved";
                    case ActionPriority.Open:
                        return "Open";
                    default:
                        return "Unknown";
                }
            };
            const fetchIssueData = async () => {
                try {
                    const responseData = await fetchDataFromIssueAPI();
                    if (responseData?.incidents.length > 0) {
                        const extractedData = responseData.incidents.map((item: any) => ({
                            unique_id: item.task.unique_id,
                            title: item.task.title,
                            taskId: item.task.task_id,
                            status: getStatusName(item.task.status_id),
                            name: item.task.site.name,
                            reported_By: " Reported by " + item.task.creator.firstname + " " + item.task.creator.lastname,
                            firstname: item.task.creator.firstname,
                            lastname: item.task.creator.lastname,
                            categoryLabel: item.category.label,
                            createdAt: item.task.created_at,
                            updateAt: moment(item.task.created_at).fromNow()
                        }));
                        setIssueData(extractedData);
                    }
                    setIsLoading(false);
                    setTimeout(() => {

                    }, 100);
                } catch (error) {
                    setIsLoading(false);
                    const errorObj = { ErrorMethodName: "use effect", CustomErrormessage: "error in use effect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                    void logGenerator(props.provider, errorObj);
                    const errorMessage = getErrorMessageValue(error.message);
                    setError(errorMessage);
                    sethasError(true);
                } finally {

                }
            };

            fetchIssueData();
        } catch (error) {
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "use effect", CustomErrormessage: "error in use effect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    }, [isRefreshGrid]);
    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}
            <div className="cls-viewaction-filter">
                <Link className="actionBtn iconSize btnRefresh issue-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                    text="">
                    <TooltipHost
                        content={"Refresh Grid"}
                        id={tooltipId}
                    >
                        <FontAwesomeIcon
                            icon={"arrows-rotate"}
                        />
                    </TooltipHost>    </Link>
            </div>
            {isViewCard === false &&
                <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid">

                    {!!IssueData && IssueData.length > 0 &&
                        <div className="card-Action-New">
                            {IssueData.length > 0 && IssueData.map((e1, i1) => {
                                return (
                                    <div className="cardHeader-Action" onClick={() => onClick_IssueData(e1)}>
                                        <h3>{e1.title}</h3>
                                        <div className="dflex alignItemsCenter gap15 mt-2 fs-14">
                                            <div className="badge badge-secondary">{e1.unique_id}</div>

                                            <div className="badge badge-secondary">{e1.categoryLabel}</div>
                                            {e1.priority == "Low" && <div className="greenBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-down" /></span>{e1.priority}</div>}
                                            {e1.priority == "Medium" && <div className="yellowBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angle-up" /></span>{e1.priority}</div>}
                                            {e1.priority == "High" && <div className="redBadgeact badge-mar-o"><span><FontAwesomeIcon className="act-ic-mar actmr3" icon="angles-up" /></span>{e1.priority}</div>}


                                            <div className="fs-14 dflex alignItemsCenter gap3"><svg className="dflex alignItemsCenter gap3 bi bi-people-fill" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                                            </svg> <span className="mld3">{e1.reported_By}</span></div>
                                            <div className="dflex alignItemsCenter gap3"><svg className="svg-inline--fa bi bi-building" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                                            </svg> {e1.name}</div>
                                            <span className="mla">updated {e1.updateAt}</span>
                                            {e1.status == "To Do" && <span className="skybluetext">{e1.status}</span>}
                                            {e1.status == "Resolved" && <span className="greentext">{e1.status}</span>}
                                            {e1.status == "In Progress" && <span className="yellowtext">{e1.status}</span>}
                                            {e1.status == "Open" && <span className="redtext">{e1.status}</span>}
                                        </div>
                                    </div>);
                            })}
                        </div>}
                    {window.innerWidth > 768 &&
                        <div className="issue-not-found">
                            {apiissueerror &&
                                <div className='noRecordFound'>
                                    <span >This Site name is not found in Safety Culture.</span>
                                </div>}
                            {IssueData.length == 0 && apiissueerror == false &&
                                <NoRecordFound />
                            }
                        </div>
                    }
                    {window.innerWidth <= 768 &&
                        <div className="issue-not-found-mob">
                            {apiissueerror &&
                                <div className='noRecordFound'>
                                    <span >This Site name is not found in Safety Culture.</span>
                                </div>}
                            {IssueData.length == 0 && apiissueerror == false &&
                                <NoRecordFound />
                            }
                        </div>
                    }
                </div>
            }
        </>;
    }
};