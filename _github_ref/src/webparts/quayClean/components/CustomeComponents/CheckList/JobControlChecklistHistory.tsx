/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GroupHeader, IDetailsGroupRenderProps, IGroupHeaderProps, Link, TooltipHost } from "@fluentui/react";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { Loader } from "../../CommonComponents/Loader";
import { getConvertedDate, logGenerator, _onItemSelected } from "../../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { useId } from "@fluentui/react-hooks";

export interface IHistoryProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    isModelOpen: boolean;
    closeModel(): any;
    context: WebPartContext;
    siteMasterId: any;
    Month?: string;
    Year?: string;
    QuestionId?: string;
    isSiteName?: boolean;
}

export interface IHistoryState {
    isModelOpen: boolean;
    userNameOptions: IReactSelectOptionProps[];
    userRoleOptions: IReactSelectOptionProps[];
}

export const JobControlChecklistHistory = (props: IHistoryProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    const [groups, setGroups] = React.useState<any[]>([]);
    const [HistoryData, setHistoryData] = React.useState<any[]>([]);
    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        imageURL;
        setShowModal(!showModal);
    };
    const tooltipId = useId('tooltip');
    const [validationMessage, setValidationMessage] = React.useState<any>();
    const [isformValidationModelOpen, setIsformValidationModelOpen] = React.useState<boolean>(false);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);

    const [state, setState] = React.useState<IHistoryState>({
        isModelOpen: props.isModelOpen,
        userNameOptions: [],
        userRoleOptions: []
    });

    const onCloseModel = () => {
        props.closeModel();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const HistoryColumn = () => {
        let column: any[] = [
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
            { key: "key4", name: 'Month', fieldName: 'Month', isResizable: true, minWidth: 80, maxWidth: 100, isSortingRequired: true },
            { key: "key5", name: 'Year', fieldName: 'Year', isResizable: true, minWidth: 50, maxWidth: 80, isSortingRequired: true },
            {
                key: "Current Status", name: 'Current Status', fieldName: 'ID', isResizable: true, minWidth: 120, maxWidth: 180,
                onRender: ((itemID: any) => {
                    if (itemID.CurrentStatus == "Not Yet Checked") {
                        return <div className='greenGrey badge dInlineBlock jcc-badge'>{itemID.CurrentStatus}</div >;
                    } else if (itemID.CurrentStatus == "Completed") {
                        return <div className='greenBadge badge dInlineBlock jcc-badge'>{itemID.CurrentStatus}</div >;
                    } else if (itemID.CurrentStatus == "Not Required") {
                        return <div className='yellowBadge badge dInlineBlock jcc-badge'>{itemID.CurrentStatus}</div >;
                    } else if (itemID.CurrentStatus == "Overdue") {
                        return <div className='redBadge badge dInlineBlock jcc-badge'>{itemID.CurrentStatus}</div >;
                    }
                })
            },
            {
                key: "Previous Status", name: 'Previous Status', fieldName: 'ID', isResizable: true, minWidth: 120, maxWidth: 180,
                onRender: ((itemID: any) => {
                    if (itemID.PreviousStatus == "Not Yet Checked") {
                        return <div className='greenGrey badge dInlineBlock jcc-badge'>{itemID.PreviousStatus}</div >;
                    } else if (itemID.PreviousStatus == "Completed") {
                        return <div className='greenBadge badge dInlineBlock jcc-badge'>{itemID.PreviousStatus}</div >;
                    } else if (itemID.PreviousStatus == "Not Required") {
                        return <div className='yellowBadge badge dInlineBlock jcc-badge'>{itemID.PreviousStatus}</div >;
                    } else if (itemID.PreviousStatus == "Overdue") {
                        return <div className='redBadge badge dInlineBlock jcc-badge'>{itemID.PreviousStatus}</div >;
                    }
                })
            },
            { key: "key4", name: 'Current Frequency', fieldName: 'CurrentFrequency', isResizable: true, minWidth: 150, maxWidth: 180, isSortingRequired: true },
            { key: "key5", name: 'Previous Frequency', fieldName: 'PreviousFrequency', isResizable: true, minWidth: 140, maxWidth: 160, isSortingRequired: true },
            { key: "key5", name: 'Updated By', fieldName: 'Author', isResizable: true, minWidth: 120, maxWidth: 140, isSortingRequired: true },
            // { key: "key5", name: 'Updated On', fieldName: 'Created', isResizable: true, minWidth: 100, maxWidth: 120, isSortingRequired: true },
        ];
        if (props.isSiteName) {
            column = column.filter(item => item.key != "SiteName")
        }
        return column;
    };


    const getHistoryData = () => {
        try {
            let Filter = "";
            setIsLoading(true);
            if (props?.QuestionId !== '') {
                if (props?.siteMasterId) {
                    Filter = `Month eq '${props?.Month}' and Year eq '${props?.Year}' and SiteNameId eq '${props?.siteMasterId}' and QuestionId eq '${props?.QuestionId}'`;
                } else {
                    Filter = `Month eq '${props?.Month}' and Year eq '${props?.Year}' and QuestionId eq '${props?.QuestionId}'`;
                }
            } else {
                if (props?.siteMasterId) {
                    Filter = `Month eq '${props?.Month}' and Year eq '${props?.Year}' and SiteNameId eq '${props?.siteMasterId}'`;
                } else {
                    Filter = `Month eq '${props?.Month}' and Year eq '${props?.Year}'`;
                }
            }
            let queryOptions: IPnPQueryOptions = {
                listName: ListNames.JobControlChecklistHistory,
                select: ["Id", "QuestionId", "Question/Title", "CurrentFrequency", "PreviousFrequency", "CurrentStatus", "PreviousStatus", "Month", "Year", "AuthorId", "Author/Title", "Created", "SiteNameId", "SiteName/Title"],
                expand: ["Question", "Author", "SiteName"],
                filter: Filter
            };
            props.provider.getItemsByQuery(queryOptions).then((results: any) => {
                if (!!results) {
                    let allData: any = results.map((data: any) => {
                        let aaItems: any = {
                            ID: data.ID,
                            Question: !!data?.Question ? data?.Question?.Title : "",
                            Created: !!data.Created ? getConvertedDate(data.Created) : "",
                            CurrentStatus: !!data.CurrentStatus ? data.CurrentStatus : "",
                            PreviousStatus: !!data.PreviousStatus ? data.PreviousStatus : "",
                            CurrentFrequency: !!data.CurrentFrequency ? data.CurrentFrequency : "",
                            PreviousFrequency: !!data.PreviousFrequency ? data.PreviousFrequency : "",
                            Month: !!data.Month ? data.Month : "",
                            Year: !!data.Year ? data.Year : "",
                            SiteNameId: !!data.SiteNameId ? data.SiteName : '',
                            SiteName: !!data.SiteName ? data.SiteName?.Title : '',
                            Author: !!data.Author ? data.Author.Title : "",
                        };
                        return aaItems;
                    });
                    const questionOrderMap = new Map<string, number>();
                    // Populate the map with the order of first appearances
                    allData?.forEach((item: any, index: any) => {
                        if (!questionOrderMap.has(item.Question)) {
                            questionOrderMap.set(item.Question, index);
                        }
                    });

                    // Sort the data based on the order in the map
                    // const sortedData = allData?.sort((a: any, b: any) => {
                    //     const orderA = questionOrderMap.get(a.Question) ?? 0;
                    //     const orderB = questionOrderMap.get(b.Question) ?? 0;
                    //     return orderA - orderB;
                    // });
                    const sortedData = allData?.sort((a: any, b: any) => {
                        const orderA = questionOrderMap.get(a.Question) ?? 0;
                        const orderB = questionOrderMap.get(b.Question) ?? 0;

                        if (orderA !== orderB) {
                            return orderA - orderB; // first priority: Question order
                        }

                        return b.ID - a.ID; // second priority: bigger ID first
                    });


                    const groupedData = sortedData?.reduce((acc: any, item: any, index: any) => {
                        const key = item.Question;
                        if (!acc[key]) {
                            acc[key] = { key: `group${key}${index}`, name: `${key}`, startIndex: index, count: 0, level: 0 };
                        }
                        acc[key].count += 1;
                        return acc;
                    }, {});

                    const groups = Object?.values(groupedData);

                    setHistoryData(allData);
                    setGroups(groups);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  getSkillSet",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect GetSkillSet"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onRenderGroupHeader = (props: IGroupHeaderProps | undefined): JSX.Element => {
        if (!props) return <div />;
        return (
            <GroupHeader
                {...props}
                onRenderTitle={() => (
                    <div onClick={() => console.log("")}>
                        {props.group?.name}
                    </div>
                )}
            />
        );
    };

    const groupProps: IDetailsGroupRenderProps = {
        onRenderHeader: onRenderGroupHeader,
    };

    React.useEffect(() => {
        getHistoryData();
    }, []);

    const modelContent = <>
        <div className="ms-SPLegacyFabricBlock">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div id="HistoryGrid" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                {!!HistoryData && HistoryData.length > 0 &&
                                    <MemoizedDetailList
                                        manageComponentView={props.manageComponentView}
                                        groups={groups}
                                        columns={HistoryColumn() as any}
                                        items={HistoryData || []}
                                        reRenderComponent={true}
                                        onSelectedItem={_onItemSelected}
                                        searchable={true}
                                        gridId="HistoryGrid"

                                    />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    </>;

    return <>
        {isLoading && <Loader />}
        {isErrorModelOpen && <CustomModal closeButtonText="Close" isModalOpenProps={isErrorModelOpen} setModalpopUpFalse={() => { setIsErrorModelOpen(false); }} subject={"Something went wrong."} message={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}

        {state.isModelOpen &&
            < CustomModal
                isModalOpenProps={state.isModelOpen}
                setModalpopUpFalse={onCloseModel}
                subject={"View History"}
                message={modelContent}
                closeButtonText={"Close"}
                dialogWidth="1250px"
            />
        }

        {isformValidationModelOpen &&
            < CustomeDialog
                isDialogOpen={isformValidationModelOpen}
                dialogMessage={validationMessage}
                closeText={"Close"}
                dialogWidth="400px"
                onClickClose={() => {
                    setIsformValidationModelOpen(false);
                    setValidationMessage("");
                }} />
        }
    </>;

};