import React from "react"

import { IDropdownOption, Link, TooltipHost } from "@fluentui/react";
import { useId } from "@uifabric/react-hooks";

import { useAtomValue } from "jotai";
import { generateExcelTable, getCAMLQueryFilterExpression, getUniueRecordsByColumnName, logGenerator, mapSingleValue, onBreadcrumbItemClicked } from "../../../../../Common/Util";
import { DataType, MinutesCirculatedToValue } from "../../../../../Common/Constants/CommonConstants";
import { ComponentNameEnum, ListNames, WHSCommitteeMeetingTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import CamlBuilder from "camljs";
import { IWHSCommitteeMeetingMaster } from "./IAddWHSMeetingFroms";
import { toastService } from "../../../../../Common/ToastService";
import { IWHSMeetingGridProps } from "./WHSMeetingGrid";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IExportColumns } from "../UserActivityLog";
import ProgressBarWithTooltip from "../../../../../Common/ProgressBarWithTooltip";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { IToolboxTalkSignatureData } from "../IMS/ToolboxTalk/ListToolboxTalk";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

export interface IWHSMeetingGridDataState {
    isLoading: boolean;
    column: any[];
    items: IWHSCommitteeMeetingMaster[];
    isEditButtonShow: boolean;
    isDeleteButtonShow: boolean;
    selectedItem: IWHSCommitteeMeetingMaster[];
    isSuccessOrValidationShow?: boolean;
    dialogSubject: any;
    dialogMessage: any;
    isReload: boolean;
    componentProps?: any;
    selectedLocation: any[];
    locationOptions: any[];
    filterType: string;
    summaryData: any;
    filterItems: any[];
    keyUpdate: number
}

export const WHSMeetingGridData = (props: IWHSMeetingGridProps) => {
    const tooltipId = useId('tooltip');
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<IWHSMeetingGridDataState>({
        isLoading: false,
        column: [],
        items: [],
        selectedItem: [],
        isDeleteButtonShow: false,
        isEditButtonShow: false,
        isSuccessOrValidationShow: false,
        dialogSubject: "",
        dialogMessage: "",
        isReload: false,
        selectedLocation: [],
        filterType: "",
        locationOptions: [],
        summaryData: null,
        filterItems: [],
        keyUpdate: Math.random()

    });
    // const [isSignatureDataGet, setIsSignatureDataGet] = React.useState<boolean>(false);
    // const [isSetSignatureData, setIsSetSignatureData] = React.useState<boolean>(false);
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Top 30 Records', text: 'Top 30 Records' });
    const [signatureItems, setSignatureItems] = React.useState<any[]>([]);
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


    const getSummaryData = (ListData: any) => {

        // const totalCompletedSignature = ListData.filter((i: any) => i.isCompletedSignature == true).length;
        // const totalPendingSignature = ListData.filter((i: any) => i.isCompletedSignature == false).length;
        const totalSignature = ListData.reduce(
            (sum: any, item: any) => sum + (item.totalSignature || 0),
            0
        );
        const totalCompletedSignature = ListData.reduce(
            (sum: any, item: any) => sum + (item.completedSignature || 0),
            0
        );
        const totalPendingSignature = totalSignature - totalCompletedSignature;
        return {
            totalPendingSignature,
            total: ListData?.length || 0,
            totalCompletedSignature
        };
    };

    const handleCardClick = (title: string | null) => {
        if (title) {
            setState((prevState) => ({ ...prevState, filterType: title }));
        } else {
            setState((prevState) => ({ ...prevState, filterType: "" }));
        }
    }



    const onChangeLocationFilter = (value: any) => {
        if (!!value && value.length > 0) {
            let items: any[] = value.map((i: any) => i.value)
            setState((prevState) => ({ ...prevState, selectedLocation: items }))
        } else {
            setState((prevState) => ({ ...prevState, selectedLocation: [] }))
        }
    }


    const renderToolTipsAttendees = (attendees: any, isArrayOnly?: boolean, otherItem?: string) => {
        let user: any[] = [];
        if (isArrayOnly) {
            user = attendees
        } else {
            user = attendees.map((i: any) => i.value);
        }

        const attendeesList = user
        const displayNames = attendeesList;
        return (
            <>
                {/* {displayNames.map((name: any, index: any) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))} */}
                {displayNames.map((name: any, index: any) => {
                    if (isArrayOnly && otherItem) {
                        if (name == MinutesCirculatedToValue.Other) {
                            return <span key={index} className={otherItem !== '...' ? "attendees-badge-cls" : ''}>{otherItem}</span>
                        } else {
                            return <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                        }

                    } else {
                        return <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                    }

                })}
            </>
        );
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            if (item.length == 1) {
                setState((prevState) => ({ ...prevState, isEditButtonShow: true, isDeleteButtonShow: true, selectedItem: item }))
            } else {
                setState((prevState) => ({ ...prevState, isEditButtonShow: false, isDeleteButtonShow: true, selectedItem: item }))

            }

        } else {
            setState((prevState) => ({ ...prevState, isEditButtonShow: false, isDeleteButtonShow: false, selectedItem: [] }))

        }
    };




    const renderAttendees = (attendees: any, isArrayOnly?: boolean, otherItem?: string) => {
        let user: any[] = [];
        if (isArrayOnly) {
            user = attendees
        } else {
            user = attendees.map((i: any) => i.value);
        }

        const attendeesList = user
        const displayNames = attendeesList.length > 5 ?
            attendeesList.slice(0, 5).concat(['...']) :
            attendeesList;
        return (
            <>
                {displayNames.map((name: any, index: any) => {
                    if (isArrayOnly && otherItem) {
                        if (name == MinutesCirculatedToValue.Other) {
                            return <span key={index} className={otherItem !== '...' ? "attendees-badge-cls" : ''}>{otherItem}</span>
                        } else {
                            return <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                        }

                    } else {
                        return <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                    }

                })}
            </>
        );
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "Meeting", key: "Title" },
                { header: "Date", key: "MeetingDate" },
                { header: "Location", key: "Location" },
                { header: "Attendees", key: "AttendeesName" },
                { header: "Apologies", key: "ApologiesName" },
                { header: "Start Time / End Time", key: "StartTimeEndTime" },
                { header: "Minutes Circulated To", key: "MinutesCirculatedToName" },
                { header: "Completed/ Total Signature", key: "renderCompletedTotalSignature" },
                { header: "Created Date", key: "Created" },
                { header: "Modified Date", key: "Modified" },
            ];
            generateExcelTable(state.items, exportColumns, `WHS Meeting.xlsx`);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "onclickExportToExcel",
                CustomErrormessage: "error in download",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(props.provider, errorObj);
        }
    };




    const generateColumn = () => {
        let column: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', isResizable: false, minWidth: 40, maxWidth: 80, isSortingRequired: false,
                onRender: ((item: IWHSCommitteeMeetingMaster) => {
                    return <div> <Link className="actionBtn btnView" onClick={() => {
                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                        breadCrumItems.push({ text: item.Title, key: item?.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.DetailToolboxTalk, siteMasterId: props?.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props?.componentProps?.siteName, qCState: props?.componentProps?.qCState } });
                        props.manageComponentView({
                            // currentComponentName: ComponentNameEnum.WHSMeetingDetail, propsdata: props.componentProps, whsMasterId: item.Id, isDirectView: props.isDirectView 
                            // currentComponentName: ComponentNameEnum.WHSMeetingDetail, qCStateId: props?.qCStateId, originalState: props.originalState || props.componentProps.originalState, dataObj: props.componentProps.dataObj, siteMasterId: props.originalSiteMasterId.ID, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView,
                            // propsdata: props.componentProps, whsMasterId: item.Id,
                            currentComponentName: ComponentNameEnum.WHSMeetingDetail, qCStateId: props?.qCStateId, originalState: props?.originalState || props.componentProps?.originalState, dataObj: props?.componentProps?.dataObj, siteMasterId: props?.siteMasterId, originalSiteMasterId: props?.siteMasterId, siteName: props?.componentProps?.siteName, qCState: props?.componentProps?.qCState, isDirectView: props?.isDirectView,
                            propsdata: props?.componentProps, whsMasterId: item.Id,
                            breadCrumItems: breadCrumItems
                        })
                    }}>
                        <TooltipHost content={"View Site Detail"} id={tooltipId}>
                            <FontAwesomeIcon icon="eye" />
                        </TooltipHost>
                    </Link></div>
                })
            },
            { key: "key9", name: 'Meeting', fieldName: 'Title', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true },
            { key: "key1", name: 'Location', fieldName: 'Location', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true },
            {
                key: 'renderCompletedTotalSignature', name: 'Completed/ Total Signature', fieldName: 'renderCompletedTotalSignature', isResizable: true, minWidth: 220, maxWidth: 220, isSortingRequired: true,
                onRender: (item: any) => {
                    return item.isSignatureLoading ? <div>
                        <span style={{ width: "75px" }}>
                            <FontAwesomeIcon className="spinerColor" icon={faSpinner} spin />
                        </span>
                    </div> : <ProgressBarWithTooltip renderCompletedTotalSignature={item?.renderCompletedTotalSignature} progressValue={item?.completedSignature} maxValue={item?.totalSignature} pendingSingUserName={item.pendingUserNames} />
                },
            },
            { key: "key2", name: 'Date', fieldName: 'MeetingDate', isResizable: false, minWidth: 80, maxWidth: 100, isSortingRequired: true },
            {
                key: "key3", name: 'Start Time / End Time', fieldName: 'StartTime', isResizable: true, minWidth: 150, maxWidth: 150, isSortingRequired: true,
                onRender: (item: IWHSCommitteeMeetingMaster) => {
                    return <>{item.StartTime} - {item.EndTime}</>
                },
            },
            {
                key: 'key5', name: 'Attendees', fieldName: 'Attendees', isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true,
                onRender: (item: IWHSCommitteeMeetingMaster) => {
                    if (!!item.Attendees && item.Attendees.length > 0) {
                        return <>
                            <Link className="tooltipcls">
                                <TooltipHost content={renderToolTipsAttendees(item.Attendees)} id={tooltipId}>
                                    {renderAttendees(item.Attendees)}
                                </TooltipHost>
                            </Link>
                        </>

                    }
                },
            },
            {
                key: 'key6', name: 'Apologies', fieldName: 'Apologies', isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true,
                onRender: (item: IWHSCommitteeMeetingMaster) => {
                    if (!!item.Apologies && item.Apologies.length > 0) {
                        return <>
                            <Link className="tooltipcls">
                                <TooltipHost content={renderToolTipsAttendees(item.Apologies)} id={tooltipId}>
                                    {renderAttendees(item.Apologies)}
                                </TooltipHost>
                            </Link>
                        </>

                    }
                },
            },
            {
                key: "key7", name: 'Minutes Circulated To', fieldName: 'MinutesCirculatedTo', isResizable: true, minWidth: 160, maxWidth: 180, isSortingRequired: true,
                onRender: (item: IWHSCommitteeMeetingMaster) => {
                    if (!!item.MinutesCirculatedTo && item.MinutesCirculatedTo.length > 0) {
                        return <>
                            <Link className="tooltipcls">
                                <TooltipHost content={renderToolTipsAttendees(item.MinutesCirculatedTo, true, item?.Other ? item.Other : "")} id={tooltipId}>
                                    {renderAttendees(item.MinutesCirculatedTo, true, item?.Other ? item.Other : "")}
                                </TooltipHost>
                            </Link>
                        </>

                    }
                }


            },
            { key: "key8", name: 'Created', fieldName: 'Created', isResizable: false, minWidth: 100, maxWidth: 100, isSortingRequired: true },
            { key: "key10", name: 'Modified', fieldName: 'Modified', isResizable: false, minWidth: 100, maxWidth: 100, isSortingRequired: true },


        ]
        return column

    }


    const _onItemInvoked = (item: IWHSCommitteeMeetingMaster): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: item.Title, key: item?.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.DetailToolboxTalk, siteMasterId: props?.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props?.componentProps?.siteName, qCState: props?.componentProps?.qCState } });
        props.manageComponentView({
            // whsMasterId: item.Id,
            // currentComponentName: ComponentNameEnum.WHSMeetingDetail, originalState: props.originalState || props.componentProps.originalState, dataObj: props.componentProps.dataObj, siteMasterId: props.siteMasterId, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView
            currentComponentName: ComponentNameEnum.WHSMeetingDetail, qCStateId: props?.qCStateId, originalState: props?.originalState || props.componentProps?.originalState, dataObj: props?.componentProps?.dataObj, siteMasterId: props?.siteMasterId, originalSiteMasterId: props?.siteMasterId, siteName: props?.componentProps?.siteName, qCState: props?.componentProps?.qCState, isDirectView: props?.isDirectView,
            propsdata: props?.componentProps, whsMasterId: item.Id, breadCrumItems: breadCrumItems,
        });

    };

    const onCloseDialogSucess = () => {
        setState((prevState) => ({
            ...prevState, isSuccessOrValidationShow: false, dialogSubject: "", dialogMessage: ""
        }));
    }

    const onClickDeleteIcon = () => {
        setState((prevState) => ({
            ...prevState, isSuccessOrValidationShow: true, dialogSubject: "Delete Item", dialogMessage: "Are you sure, you want to delete this record?"
        }));
    }



    const getWHSSignature = async (WHSMasterId?: number[]) => {
        try {
            let whsSignatureData: any[] = [];

            const camlQuery = new CamlBuilder()
                .View(['ID', 'Title', 'WHSMaster', 'Signature', 'WHSUsers'])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
            let filterFields: ICamlQueryFilter[] = [];
            // if (!!WHSMasterId && WHSMasterId.length > 0)
            //     filterFields.push({
            //         fieldName: "WHSMaster",
            //         fieldValue: WHSMasterId,
            //         fieldType: FieldType.LookupById,
            //         LogicalType: LogicalType.In
            //     });


            if (filterFields.length > 0) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }

            let data = await props.provider.getItemsByCAMLQuery(ListNames.WHSSignature, camlQuery.ToString());
            if (!!data && data.length > 0) {
                whsSignatureData = data.map((i) => {
                    return {
                        ID: mapSingleValue(i.ID, DataType.number),
                        Title: mapSingleValue(i.Title, DataType.string),
                        Signature: mapSingleValue(i.Signature, DataType.string),
                        WHSMaster: mapSingleValue(i.WHSMaster, DataType.lookup),
                        WHSUsers: mapSingleValue(i.WHSUsers, DataType.lookup),
                        WHSUsersId: mapSingleValue(i.WHSUsers, DataType.lookupId)
                    }
                })
            }
            setSignatureItems(whsSignatureData)
            // setIsSignatureDataGet(true)
            return whsSignatureData;
        } catch (error) {
            // setIsSignatureDataGet(true);

            console.log(error);
            return []
        }
    }



    const getItemsWHSMaster = async () => {
        let items: IWHSCommitteeMeetingMaster[] = [];

        let data: any[] = []
        let camlQuery;

        // Default CAML builder base
        const baseViewFields = [
            "MinutesCirculatedTo", "MeetingDate", "Apologies", "Attendees",
            "Other", "EndTime", "StartTime", "Location", "ID",
            "Title", "Created", "Editor", "Modified", "Author", "SignatureDoneBy"
        ];

        if (selectedItem?.key === "Top 30 Records") {
            camlQuery = new CamlBuilder()
                .View(baseViewFields)
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(30, false) // Top 30 items only
                .Query()
                .Where()
                .ChoiceField("WHSCommitteeMeetingType").EqualTo(WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingMinutes)
                .Or()
                .ChoiceField("WHSCommitteeMeetingType").IsNull()
                .ToString();

            data = await provider.getItemsByCAMLQuery(
                ListNames.WHSCommitteeMeetingMaster,
                camlQuery,
                { SortField: "Modified", SortDir: "Desc" }
            );
        } else if (selectedItem?.key == 'All Dates' || selectedItem === null || selectedItem === undefined) {
            camlQuery = new CamlBuilder()
                .View(baseViewFields)
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
                .Where()
                .ChoiceField("WHSCommitteeMeetingType").EqualTo(WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingMinutes)
                .Or()
                .ChoiceField("WHSCommitteeMeetingType").IsNull()
                .ToString();

            data = await provider.getItemsByCAMLQuery(
                ListNames.WHSCommitteeMeetingMaster,
                camlQuery,
                { SortField: "Modified", SortDir: "Desc" }
            );
        } else {
            let startDate = filterFromDate;
            let endDate = filterToDate;

            if (!filterFromDate || !filterToDate) {
                startDate = moment().subtract(29, "days").format("YYYY-MM-DD");
                endDate = moment().format("YYYY-MM-DD");
            }
            camlQuery = new CamlBuilder()
                .View(baseViewFields)
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
                .Where()
                .DateField("MeetingDate").GreaterThanOrEqualTo(startDate)
                .And()
                .DateField("MeetingDate").LessThanOrEqualTo(endDate)
                .And()
                .ChoiceField("WHSCommitteeMeetingType").EqualTo(WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingMinutes)
                .Or()
                .ChoiceField("WHSCommitteeMeetingType").IsNull()
                .ToString();
            data = await provider.getItemsByCAMLQuery(
                ListNames.WHSCommitteeMeetingMaster,
                camlQuery,
                { SortField: "Modified", SortDir: "Desc" }
            );
        }



        // let data = await provider.getItemsByCAMLQuery(ListNames.WHSCommitteeMeetingMaster, camlQuery, { SortField: "Modified", SortDir: "Desc" })

        if (!!data && data.length > 0) {
            if (!!state.selectedLocation && state.selectedLocation.length > 0) {
                data = data.filter((i) => state.selectedLocation.indexOf(i.Location) > -1)
            }
            let WHSSignatureId: number[] = [];
            if (!!props.siteMasterId && props.siteMasterId > 0 && data.length > 0) {
                WHSSignatureId = data.map((r) => r.ID).filter((value, index, self) => self.indexOf(value) === index);
            }



            // let whsSignatureIdData = signatureItems;
            items = data.map((i: any) => {

                let completedSignatureCount: number = 0;
                let completedSignData: any[] = i.SignatureDoneBy || [];
                let pendingUserName: any[] = []
                // if (whsSignatureIdData?.length > 0) {
                // completedSignData = whsSignatureIdData.filter(j => j.WHSMaster.Id == Number(i.ID)) || []
                let completedSingUserId = completedSignData.map(r => r.lookupId) || [];
                pendingUserName = i?.Attendees?.filter((i: any) => completedSingUserId.indexOf(i.lookupId) == -1)?.map((r: any) => r?.lookupValue) || []
                completedSignatureCount = completedSignData?.length
                // }
                let totalSignature: number = 0
                if (!!i?.Attendees && i?.Attendees?.length) {
                    totalSignature = i?.Attendees?.length || 0
                }

                return {
                    completedSignature: completedSignatureCount,
                    mainAttendees: i.Attendees,
                    // isSignatureLoading: isSignatureDataGet == true ? false : true,
                    isSignatureLoading: false,
                    renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
                    totalSignature: totalSignature,
                    pendingUserNames: pendingUserName,
                    // isCompletedSignature: totalSignature == completedSignatureCount || 0,
                    isCompletedSignature: ((totalSignature > 0) ? totalSignature == completedSignatureCount : false) || false,
                    MinutesCirculatedTo: mapSingleValue(i.MinutesCirculatedTo, DataType.ChoiceMultiple),
                    MeetingDate: mapSingleValue(i.MeetingDate, DataType.Date),
                    Apologies: mapSingleValue(i.Apologies, DataType.lookupMuilt),
                    MinutesCirculatedToName: !!i.MinutesCirculatedTo ? i?.MinutesCirculatedTo?.join(", ") : "",
                    ApologiesName: mapSingleValue(i.Apologies, DataType.lookupMuilt)?.map((apology: any) => apology?.value)?.join(", "),
                    Attendees: mapSingleValue(i.Attendees, DataType.lookupMuilt),
                    AttendeesName: mapSingleValue(i.Attendees, DataType.lookupMuilt)?.map((attendees: any) => attendees?.value)?.join(", "),
                    // MinutesCirculatedToName: i.MinutesCirculatedTo?.join(", ") || "",
                    Other: mapSingleValue(i.Other, DataType.string),
                    EndTime: mapSingleValue(i.EndTime, DataType.string),
                    StartTime: mapSingleValue(i.StartTime, DataType.string),
                    StartTimeEndTime: mapSingleValue(i.StartTime, DataType.string) + mapSingleValue(i.EndTime, DataType.string),
                    Location: mapSingleValue(i.Location, DataType.string),
                    Title: mapSingleValue(i.Title, DataType.string),
                    Id: mapSingleValue(i.ID, DataType.number),
                    Created: mapSingleValue(i.Created, DataType.DateTime),
                    Editor: mapSingleValue(i.Editor, DataType.peoplePicker),
                    Author: mapSingleValue(i.Author, DataType.peoplePicker),
                    Modified: mapSingleValue(i.Modified, DataType.DateTime)
                }
            })
        }
        return items;
    }

    React.useEffect(() => {
        getWHSSignature();
    }, [])

    React.useEffect(() => {
        const filterList = () => {
            let filteredList = state.items;
            if (state.filterType === "Total") {
                filteredList = state.items;
            } else if (state.filterType === "Pending signature") {
                filteredList = state.items.filter((item: any) =>
                    item.isCompletedSignature == false
                );
            }
            else if (state.filterType === "Completed Signature") {
                filteredList = state.items.filter((item: any) =>
                    item.isCompletedSignature == true
                );
            }
            // setIsLoading(false);
            setState((prevState) => ({ ...prevState, filterItems: filteredList }))
        };
        // setIsLoading(true);
        filterList();

    }, [state.filterType]);


    // React.useEffect(() => {
    //     let updateItems = state.items;
    //     setTimeout(() => {
    //         if (!!state.items && state.items.length > 0 && isSetSignatureData) {
    //             let items = state.items.filter((i: any) => i.isSignatureLoading)
    //             if (items.length > 0) {
    //                 updateItems = state.items.map((data) => {
    //                     let completedSignatureCount: number = 0;
    //                     let completedSignData: any[] = [];
    //                     let pendingUserName: any[] = []
    //                     if (signatureItems?.length > 0) {
    //                         completedSignData = signatureItems.filter(j => j.WHSMaster.Id == Number(data.Id)) || []
    //                         let completedSingUserId = completedSignData.map(r => r.WHSUsersId) || [];
    //                         pendingUserName = data?.mainAttendees?.filter((i: any) => completedSingUserId.indexOf(i.lookupId) == -1)?.map((r: any) => r?.lookupValue) || []
    //                         completedSignatureCount = completedSignData?.length
    //                     }
    //                     let totalSignature: number = 0
    //                     if (!!data?.mainAttendees && data?.mainAttendees?.length) {
    //                         totalSignature = data?.mainAttendees?.length || 0
    //                     }
    //                     return {
    //                         ...data,
    //                         isSignatureLoading: false,
    //                         completedSignature: completedSignatureCount,
    //                         renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
    //                         totalSignature: totalSignature,
    //                         pendingUserNames: pendingUserName,
    //                         // isCompletedSignature: totalSignature == completedSignatureCount || 0,
    //                         isCompletedSignature: ((totalSignature > 0) ? totalSignature == completedSignatureCount : false) || false,
    //                     }
    //                 })
    //                 const Summary = getSummaryData(updateItems);
    //                 setIsSetSignatureData(false);
    //                 setState((prevState) => ({
    //                     ...prevState,
    //                     items: updateItems,
    //                     keyUpdate: Math.random(),
    //                     filterItems: updateItems,
    //                     summaryData: Summary,
    //                 }))
    //             }
    //         }
    //     }, 500);
    // }, [isSignatureDataGet, isSetSignatureData]);

    React.useEffect(() => {
        (async () => {
            try {
                setState((prevState: any) => ({ ...prevState, isLoading: true }));
                let column = generateColumn();
                const [whsMasterData] = await Promise.all([getItemsWHSMaster()])
                let locationOptions: any[] = []
                let countData: any = null;
                if (whsMasterData.length > 0) {
                    countData = getSummaryData(whsMasterData);
                }

                if (!!whsMasterData && whsMasterData.length > 0 && state.selectedLocation.length == 0) {
                    locationOptions = whsMasterData.map((i) => {
                        return {
                            value: i.Location,
                            label: i.Location
                        }
                    })
                    locationOptions = getUniueRecordsByColumnName(locationOptions, "value");
                    setState((prevState) => ({ ...prevState, locationOptions: locationOptions }));
                }
                setState((prevState: any) => ({
                    ...prevState,

                    summaryData: countData,
                    isLoading: false,
                    column: column,
                    items: whsMasterData,
                    keyUpdate: Math.random(),
                    filterItems: whsMasterData
                }));
                // if (isSignatureDataGet == false) {
                //     setIsSetSignatureData(true);
                // }


            } catch (error) {
                setState((prevState: any) => ({ ...prevState, isLoading: false }));
                let errorLogObj: any = {
                    ErrorMessage: "",
                    Title: "WHSGridData",
                    PageName: "QuaysafeDashboard.aspx",
                    ErrorMethodName: "useEffect",
                    FileName: "WHSGridData",
                    Error: `${error}`
                }
                console.log(errorLogObj);
            }
        })()

    }, [state.isReload, state.selectedLocation, filterFromDate, filterToDate, selectedItem])

    return {
        state,
        _onItemInvoked,
        _onItemSelected,
        onCloseDialogSucess,
        onClickDeleteIcon,
        onclickExportToExcel,
        onChangeLocationFilter,
        onChangeRangeOption,
        fromDate,
        toDate,
        filterToDate,
        filterFromDate,
        onChangeFromDate,
        onChangeToDate,
        handleCardClick,


    }
}