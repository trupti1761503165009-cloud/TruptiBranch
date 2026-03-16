/* eslint-disable */
import { IContextualMenuProps, IDropdownOption } from "@fluentui/react";
import { useAtom } from "jotai";
import moment from "moment";
import * as React from "react";
import { useState } from "react";
import { useBoolean } from '@fluentui/react-hooks';
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { defaultValues, HazardChartMenuEnum, HazardEnum, HazardFields, HazardGridTitles, HazardViewFields } from "../../../../../../Common/Enum/HazardFields";
import { generateAndSaveKendoHazardPDF, generateAndSaveKendoPDFForReports, getCAMLQueryFilterExpression, logGenerator, UserActivityLog } from "../../../../../../Common/Util";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { IReactSelectOptionProps } from "../../../../../../Interfaces/IReactSelectOptionProps";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { buildExcelGroupings, buildUniqueOptions, formatSPDateToLocal, formatSPDateToLocalDate, generateExcelFileName, generateExcelHazardReport, generateGenericHazardExcel, generatePdfFileName, getHazardIconUrl } from "../../../CommonComponents/CommonMethods";
import StateWiseHazardChart from "./StateWiseChart/StateWiseHazardChart";
import { StateWiseHazardGrid } from "./StateWiseChart/StateWiseHazardGrid";
import DashboardBarChart, { buildHazardWiseData, buildSiteWiseData, buildStateWiseData, buildSubHazardWiseData, buildSubmissionDateWiseData } from "./Dashboard/DashboardChart";
import { DashboardGrid } from "./Dashboard/DashboardGrid";
import {
    faChartPie,
    faHome,
    faMapMarkedAlt,
    faBuilding,
    faTags,
    faSitemap,
    faCalendarDays,
    faUser,
    faListAlt,
    faChartLine,
    faUsers,
    faDashboard
} from "@fortawesome/free-solid-svg-icons";
import DashboardSiteWiseBarChart from "./Dashboard/DashboardSiteWiseChart";
import { MasterDataGrid } from "./StateWiseChart/MasterDataGrid";
import UserSubHazardChart from "./Dashboard/UserSubHazardChart";
import HazardTypeSubHazardLineChart from "./Dashboard/HazardTypeSubHazardChart";
import HazardSubHazardStackChart from "./Dashboard/HazardSubHazardStackChart";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListHazardReport } from "../HazardReport/ListHazardReport";
import { HazardListing } from "./HazardListing/HazardListing";
import { ViewHazardFormDetail } from "../HazardReport/ViewHazardFormDetail";
export interface IAreaCompliance {
    name: string;
    assigned?: number;
    completed?: number;
}

export interface IWeekOptions extends IReactSelectOptionProps {
    startDate: any;
    endDate: any;
    financialYear: any;
    weekNumber: any;
}
export interface IHazardDataState {
    selectedMenu: { key: string, DisplayName: string };
    SubmittedByOptions: any[];
    selectedSubmittedBy: any;
    selectedSubmittedByFull: any,
    selectedSubHazardType: any;
    SubHazardTypeOptions: any[];
    selectedHazardType: any;
    HazardTypeOptions: any[];
    selectedStatesId: any[];
    selectedStates: any[];
    selectedSiteIds: any[];
    selectedSiteTitles: any[];
    fromDate: any;
    toDate: any;
    filterFromDate: any;
    selectedSCSites: any[];
    selectedItem: IDropdownOption;
    filterToDate: any;
    isLoading?: boolean;
    hazardResponseItems: any[];
    filterhazardResponseItems: any[];
    keyUpdate: number;
    toggleKeyUpdate: number;
    stateKeyUpdate: number;
    topNumber: any;
    bottomNumber: any;
    isDateFilterChange: boolean;
    hazardFileContent: any;
    isRefresh: boolean;
    isPDFGenerating?: boolean;
    gridGroupingData: any;
    chartGroupingData: any;
    stateCountData: any;
    stateTabData: any;
    isViewDetail: any;
    selectedHazardItem: any;
}
export interface IHazardeReportProps {
    loginUserRoleDetails: any;
}
export const HazardChartDashboardData = (props: any) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [appGlobalState, setAppGlobalState] = useAtom(appGlobalStateAtom);
    const didMount = React.useRef(false);
    const [isPdfMode, setisPdfMode] = useState(false);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFilterHide, setIsFilterHide] = React.useState(true);
    const hazardCountCard = React.useRef<any[]>([]);
    let siteData = React.useRef<any>([]);
    const [isEmailPopupVisible, { setTrue: showEmailPopup, setFalse: hideEmailPopup }] = useBoolean(false);
    const [hazardView, setHazardView] = useState("grid");
    const [emailState, setEmailState] = React.useState({
        title: "",
        sendToEmail: "",
        displayErrorTitle: false,
        displayErrorEmail: false,
        displayError: false,
    });
    const [state, setState] = React.useState<IHazardDataState>({
        selectedMenu: { key: HazardChartMenuEnum.Grid, DisplayName: "Hazard Records" },
        isLoading: false,
        SubmittedByOptions: [],
        selectedSubmittedBy: [],
        selectedSubmittedByFull: [],
        selectedSubHazardType: [],
        SubHazardTypeOptions: [],
        selectedHazardType: [],
        HazardTypeOptions: [],
        selectedStatesId: [],
        selectedSiteTitles: [],
        selectedItem: { key: 'Last 7 Days', text: 'Last 7 Days' },
        hazardResponseItems: [],
        filterhazardResponseItems: [],
        selectedSCSites: [],
        selectedSiteIds: [],
        selectedStates: [],
        keyUpdate: Date.now(),
        stateKeyUpdate: Date.now(),
        toggleKeyUpdate: Date.now(),
        fromDate: "",
        toDate: "",
        filterFromDate: moment(new Date()).subtract(6, 'days').format(defaultValues.FilterDateFormate),
        filterToDate: moment(new Date()).format(defaultValues.FilterDateFormate),
        topNumber: 10,
        bottomNumber: 10,
        isDateFilterChange: false,
        isRefresh: false,
        hazardFileContent: '',
        isPDFGenerating: false,
        gridGroupingData: {},
        chartGroupingData: {},
        stateCountData: [],
        stateTabData: [],
        isViewDetail: false,
        selectedHazardItem: undefined
    });

    const [showDetails, setShowDetails] = React.useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
        setState((prevState: any) => ({ ...prevState, toggleKeyUpdate: Math.random() }));
    };

    const onClickLeftNavigation = (key: string, tooltip: string) => {
        setState((prevState) => ({ ...prevState, selectedMenu: { key: key, DisplayName: tooltip }, keyUpdate: Math.random() }));
    };


    const onclickExportToPDF = async () => {
        setIsLoading(true);
        setisPdfMode(true);
        // let fileName: string = generatePdfFileName(`${hazardFormDetail?.SiteName?.replace(/\s+/g, '')}_HZ`);
        let fileblob: any = await generateAndSaveKendoHazardPDF("HazardReportPDF", 'Hazard Report', false, true, true);
        setisPdfMode(false);
        setIsLoading(false);
    }

    // Menu Items for Cleaner Checklist Reports
    const menuItems = [
        {
            label: "Hazard Records",
            tooltip: "Hazard Records",
            icon: faHome,
            key: HazardChartMenuEnum.Grid,
            DisplayName: "Hazard Records"
        },
        {
            label: "Hazard Reports",
            tooltip: "Hazard Reports",
            icon: faDashboard,
            key: HazardChartMenuEnum.Dashboard,
            DisplayName: "Hazard Reports"
        },
        {
            label: "Hazard Master Report",
            tooltip: "Hazard Master Report",
            icon: faChartPie,
            key: HazardChartMenuEnum.MasterReport,
            DisplayName: "Hazard Master Report"
        },
        {
            label: HazardGridTitles[HazardFields.State],
            tooltip: HazardGridTitles[HazardFields.State],
            icon: faMapMarkedAlt,
            key: HazardChartMenuEnum.StateWiseHazard,
            DisplayName: HazardGridTitles[HazardFields.State]
        },
        {
            label: HazardGridTitles[HazardFields.SiteName],
            tooltip: HazardGridTitles[HazardFields.SiteName],
            icon: faBuilding,
            key: HazardChartMenuEnum.SiteWiseHazard,
            DisplayName: HazardGridTitles[HazardFields.SiteName]
        },
        {
            label: HazardGridTitles[HazardFields.HazardType],
            tooltip: HazardGridTitles[HazardFields.HazardType],
            icon: faTags,
            key: HazardChartMenuEnum.HazardTypeWiseReport,
            DisplayName: HazardGridTitles[HazardFields.HazardType]
        },
        {
            label: HazardGridTitles[HazardFields.HazardSubType],
            tooltip: HazardGridTitles[HazardFields.HazardSubType],
            icon: faSitemap,
            key: HazardChartMenuEnum.SubHazardTypeWiseReport,
            DisplayName: HazardGridTitles[HazardFields.HazardSubType]
        },
        {
            label: HazardGridTitles[HazardFields.SubmissionDate],
            tooltip: HazardGridTitles[HazardFields.SubmissionDate],
            icon: faCalendarDays,
            key: HazardChartMenuEnum.SubmissionDateWiseReport,
            DisplayName: HazardGridTitles[HazardFields.SubmissionDate]
        },
        {
            label: HazardGridTitles[HazardFields.SubmittedBy],
            tooltip: HazardGridTitles[HazardFields.SubmittedBy],
            icon: faUsers,
            key: HazardChartMenuEnum.UserWiseSubHazard,
            DisplayName: HazardGridTitles[HazardFields.SubmittedBy]
        },
        {
            label: HazardGridTitles.SubHazardByHazard,
            tooltip: HazardGridTitles.SubHazardByHazard,
            icon: faListAlt,
            key: HazardChartMenuEnum.SubHazardByHazard,
            DisplayName: HazardGridTitles.SubHazardByHazard
        },
        {
            label: HazardGridTitles.SubHazardByHazardTrend,
            tooltip: HazardGridTitles.SubHazardByHazardTrend,
            icon: faChartLine,
            key: HazardChartMenuEnum.SubHazardByHazardTrend,
            DisplayName: HazardGridTitles.SubHazardByHazardTrend
        },
    ];

    const onExportToExcelClick = () => {
        let fileName = "";

        switch (state.selectedMenu.key) {

            case HazardChartMenuEnum.Dashboard:
                fileName = generateExcelFileName("Dashboard");
                generateExcelHazardReport(state.filterhazardResponseItems, undefined, fileName);
                break;

            case HazardChartMenuEnum.MasterReport:
                fileName = generateExcelFileName("Master");
                generateExcelHazardReport(state.filterhazardResponseItems, undefined, fileName);
                break;

            case HazardChartMenuEnum.StateWiseHazard:
                fileName = generateExcelFileName("StateWise");
                generateGenericHazardExcel(state.gridGroupingData?.byState, HazardFields.State, fileName);
                break;

            case HazardChartMenuEnum.SiteWiseHazard:
                fileName = generateExcelFileName("SiteWise");
                generateGenericHazardExcel(state.gridGroupingData?.bySite, HazardFields.SiteName, fileName);
                break;

            case HazardChartMenuEnum.HazardTypeWiseReport:
                fileName = generateExcelFileName("HazardTypeWise");
                generateGenericHazardExcel(state.gridGroupingData?.byHazard, HazardFields.HazardType, fileName);
                break;

            case HazardChartMenuEnum.SubHazardTypeWiseReport:
                fileName = generateExcelFileName("SubHazardTypeWise");
                generateGenericHazardExcel(state.gridGroupingData?.bySubHazard, HazardFields.HazardSubType, fileName);
                break;

            case HazardChartMenuEnum.SubmissionDateWiseReport:
                fileName = generateExcelFileName("SubmissionDateWise");
                generateGenericHazardExcel(state.gridGroupingData?.bySubmission, HazardFields.SubmissionDate, fileName);
                break;
            case HazardChartMenuEnum.UserWiseSubHazard:
                fileName = generateExcelFileName("UserWise");
                generateGenericHazardExcel(state.gridGroupingData?.bySubmittedBy, HazardFields.SubmittedBy, fileName);
                break;
            case HazardChartMenuEnum.SubHazardByHazard:
                fileName = generateExcelFileName("SubHazardCountByHazard");
                generateGenericHazardExcel(state.gridGroupingData?.byHazard, HazardFields.HazardType, fileName);
                break;
            case HazardChartMenuEnum.SubHazardByHazardTrend:
                fileName = generateExcelFileName("SubHazardCountByHazard");
                generateGenericHazardExcel(state.gridGroupingData?.byHazard, HazardFields.HazardType, fileName);
                break;
            default:
                fileName = generateExcelFileName("Dashboard");
                generateExcelHazardReport(state.filterhazardResponseItems, undefined, fileName);
        }
    };

    const exportMenuProps: IContextualMenuProps = {
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
                onClick: (ev, item) => { onExportToExcelClick() },
            },
        ],
    };
    const handleUpdate = () => {
        setState((prevState: any) => ({ ...prevState, isRefresh: true, isDateFilterChange: true }));
    };


    const handleViewDetails = (hazardId: number) => {
        setState((prevState: any) => ({ ...prevState, selectedHazardItem: hazardId }));
        setShowDetails(true);
    };

    const handleBack = () => {
        setShowDetails(false);
        setState((prevState: any) => ({ ...prevState, selectedHazardItem: null }));
    };

    const onRenderComponent = () => {
        switch (state.selectedMenu.key) {
            case HazardChartMenuEnum.Grid:
                return (
                    <div key={state.keyUpdate}>
                        {!showDetails ? (
                            <HazardListing
                                hazardData={state.filterhazardResponseItems}
                                onViewDetails={handleViewDetails}
                                onItemUpdated={handleUpdate}
                                view={hazardView}
                                onViewChange={setHazardView}
                                selectedSites={state.selectedSiteTitles}
                                selectedSubmittedBy={state.selectedSubmittedBy}
                                selectedSubmittedByFull={state.selectedSubmittedByFull}
                                selectedSubHazardType={state.selectedSubHazardType}
                                filterFromDate={state.filterFromDate}
                                filterToDate={state.filterToDate}
                            />
                        ) : (
                            <ViewHazardFormDetail
                                loginUserRoleDetails={currentUserRoleDetail}
                                provider={provider}
                                context={context}
                                hazardFormId={state.selectedHazardItem}
                                componentProps={props.componentProps}
                                onBack={handleBack}
                                isChartView={true}
                            />
                        )}
                    </div>
                );

            case HazardChartMenuEnum.Dashboard:
                return <div key={state.keyUpdate}>
                    <DashboardBarChart
                        key={`state-${state.keyUpdate}`}
                        title={HazardEnum.StateWiseCount}
                        data={state?.chartGroupingData?.State}
                        level={HazardFields.State}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1036px'
                        })}
                    />

                    <div className="page-break"></div>
                    <DashboardSiteWiseBarChart
                        key={`site-${state.keyUpdate}`}
                        title={HazardEnum.SiteWiseCount}
                        data={state?.chartGroupingData?.SiteName}
                        level={HazardFields.SiteName}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />

                    <div className="page-break"></div>
                    <DashboardBarChart
                        key={`hazardType-${state.keyUpdate}`}
                        title={HazardEnum.HazardTypeWiseCount}
                        data={state?.chartGroupingData?.HazardType}
                        level={HazardFields.HazardType}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />

                    <div className="page-break"></div>
                    <DashboardBarChart
                        key={`subhazardType-${state.keyUpdate}`}
                        title={HazardEnum.SubHazardTypeWiseCount}
                        data={state?.chartGroupingData?.HazardSubType}
                        level={HazardFields.HazardSubType}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />

                    <div className="page-break"></div>

                    <DashboardBarChart
                        key={`submissiondate-${state.keyUpdate}`}
                        title={HazardEnum.SubmissionDateWiseCount}
                        data={state?.chartGroupingData?.SubmissionDate}
                        level={HazardFields.SubmissionDate}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />
                    <div className="page-break"></div>

                    <UserSubHazardChart
                        key={`usersubhazard-${state.keyUpdate}`}
                        data={state?.filterhazardResponseItems}
                        height="500px"
                        title={HazardEnum.UserWiseCount}
                    />
                    <div className="page-break"></div>
                    <HazardSubHazardStackChart
                        key={`subhazardbar-${state.keyUpdate}`}
                        data={state?.filterhazardResponseItems}
                        title={HazardEnum.SubHazardByHazard}
                        height="500px"
                    />

                    <div className="page-break"></div>
                    <div className="mb-5">
                        <HazardTypeSubHazardLineChart
                            key={`hazard-line-chart-${state.keyUpdate}`}
                            data={state?.filterhazardResponseItems}
                            title={HazardEnum.SubHazardByHazard}
                            height="500px"
                        />
                    </div>

                </div>
            case HazardChartMenuEnum.MasterReport:
                return <div key={state.keyUpdate}>
                    <StateWiseHazardChart
                        data={state.filterhazardResponseItems}
                    />
                    <div className="page-break"></div>
                    {state.isPDFGenerating ? <MasterDataGrid data={state.filterhazardResponseItems} />
                        :
                        <StateWiseHazardGrid
                            data={state.filterhazardResponseItems}
                            isPDFGenerating={state.isPDFGenerating}
                        />}
                </div>
            case HazardChartMenuEnum.StateWiseHazard:
                return <div key={state.keyUpdate}>
                    <DashboardBarChart
                        title={HazardEnum.StateWiseCount}
                        data={state?.chartGroupingData?.State}
                        level={HazardFields.State}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />

                    <div className="page-break"></div>
                    <DashboardGrid
                        data={state?.gridGroupingData?.byState}
                        groupBy={HazardFields.State}
                        title={HazardGridTitles[HazardFields.State]}
                        groupDisplayName={HazardViewFields.State}
                        isPDFGenerating={state.isPDFGenerating}
                    // isPDFGenerating={fals}
                    />

                </div>
            case HazardChartMenuEnum.SiteWiseHazard:
                return <div key={state.keyUpdate}>
                    <DashboardSiteWiseBarChart
                        title={HazardEnum.SiteWiseCount}
                        data={state?.chartGroupingData?.SiteName}
                        level={HazardFields.SiteName}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.bySite}
                        groupBy={HazardFields.SiteName}
                        title={HazardGridTitles[HazardFields.SiteName]}
                        groupDisplayName={HazardViewFields.SiteName}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case HazardChartMenuEnum.HazardTypeWiseReport:
                return <div key={state.keyUpdate}>
                    <DashboardBarChart
                        title={HazardEnum.HazardTypeWiseCount}
                        data={state?.chartGroupingData?.HazardType}
                        level={HazardFields.HazardType}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.byHazard}
                        groupBy={HazardFields.HazardType}
                        title={HazardGridTitles[HazardFields.HazardType]}
                        groupDisplayName={HazardViewFields.HazardType}
                        isPDFGenerating={state.isPDFGenerating}
                    />

                </div>
            case HazardChartMenuEnum.SubHazardTypeWiseReport:
                return <div key={state.keyUpdate}>
                    <DashboardBarChart
                        title={HazardEnum.SubHazardTypeWiseCount}
                        data={state?.chartGroupingData?.HazardSubType}
                        level={HazardFields.HazardSubType}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.bySubHazard}
                        groupBy={HazardFields.HazardSubType}
                        title={HazardGridTitles[HazardFields.HazardSubType]}
                        groupDisplayName={HazardViewFields.HazardSubType}
                        isPDFGenerating={state.isPDFGenerating}
                    />

                </div>
            case HazardChartMenuEnum.SubmissionDateWiseReport:
                return <div key={state.keyUpdate}>
                    <DashboardBarChart
                        title={HazardEnum.SubmissionDateWiseCount}
                        data={state?.chartGroupingData?.SubmissionDate}
                        level={HazardFields.SubmissionDate}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                        })}
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.bySubmission}
                        groupBy={HazardFields.SubmissionDate}
                        title={HazardGridTitles[HazardFields.SubmissionDate]}
                        groupDisplayName={HazardViewFields.SubmissionDate}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case HazardChartMenuEnum.UserWiseSubHazard:
                return <div key={state.keyUpdate}>
                    <UserSubHazardChart
                        data={state?.filterhazardResponseItems}
                        height="500px"
                        title={HazardEnum.UserWiseCount}
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.bySubmittedBy}
                        groupBy={HazardFields.SubmittedBy}
                        title={HazardGridTitles[HazardFields.SubmittedBy]}
                        groupDisplayName={HazardViewFields.SubmittedBy}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case HazardChartMenuEnum.SubHazardByHazard:
                return <div key={state.keyUpdate}>
                    <HazardSubHazardStackChart
                        data={state?.filterhazardResponseItems}
                        title={HazardEnum.SubHazardByHazard}
                        height="500px"
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.byHazard}
                        groupBy={HazardFields.HazardType}
                        title={HazardGridTitles[HazardFields.HazardType]}
                        groupDisplayName={HazardViewFields.HazardType}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case HazardChartMenuEnum.SubHazardByHazardTrend:
                return <div key={state.keyUpdate}>
                    <HazardTypeSubHazardLineChart
                        data={state?.filterhazardResponseItems}
                        title={HazardEnum.SubHazardByHazard}
                        height="500px"
                    />
                    <div className="page-break"></div>

                    <DashboardGrid
                        data={state?.gridGroupingData?.byHazard}
                        groupBy={HazardFields.HazardType}
                        title={HazardGridTitles[HazardFields.HazardType]}
                        groupDisplayName={HazardViewFields.HazardType}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            default:
                return <div>Select a report</div>;

        }
    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState((prevState) => ({ ...prevState, filterToDate: filterDate, toDate: date, isDateFilterChange: true }));
    };

    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState((prevState) => ({ ...prevState, filterFromDate: filterDate, fromDate: date, isDateFilterChange: true }));
    };

    const onChangeRangeOption = (item: IDropdownOption): void => {
        if ('Custom Range' == item.key) {
            setState((prevState) => ({
                ...prevState,
                selectedItem: item,
                filterFromDate: "",
                filterToDate: "",
                // isDateFilterChange: true

            }))
        } else {
            setState((prevState) => ({
                ...prevState, selectedItem: item,
                // isDateFilterChange: true
            }))
        }

    };

    const onStateChange = (stateIds: number[], options?: any) => {
        setState((prevState: any) => ({
            ...prevState,
            selectedStates: (!!options && options.length > 0) ? options.map((r: any) => r.Title) : [],
            selectedSiteIds: [],
            selectedStatesId: (!!stateIds && stateIds.length > 0) ? stateIds : [],
            selectedSiteTitles: [],
            selectedSCSites: [],
            selectedActionType: [],
            stateKeyUpdate: Math.random(),
            isRefresh: true
        }));
    };

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setState((prevState) => ({
            ...prevState,
            selectedSiteIds: siteIds,
            selectedSiteTitles: siteTitles,
            selectedSCSites: siteSC
        }));
    };

    const handleDropdownChange = (field: keyof IHazardDataState, selected: any, isMulti: boolean = false, isRefreshOp?: any) => {
        const newValue = isMulti
            ? (selected ? selected.map((x: any) => x.value) : [])
            : (selected ? selected.value : null);

        setState(prev => ({
            ...prev,
            [field]: newValue
        }));
        if (field === "selectedSubmittedBy") {
            setState(prev => ({
                ...prev,
                selectedSubmittedByFull: selected
            }));
        }
    };

    const handleCardClick = (title: any) => {
        setIsLoading(true);
        if (title && title?.length > 0) {
            setState((prevState: any) => ({ ...prevState, selectedHazardType: title, isRefresh: true }));
        } else {
            setState((prevState: any) => ({ ...prevState, selectedHazardType: [], isRefresh: true }));
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

    const mappingHazardData = (listItems: any[], siteItems: any[]) => {
        if (!Array.isArray(listItems) || listItems.length === 0) return [];

        try {
            const siteDict = siteItems.reduce((acc: any, cur: any) => {
                acc[cur.ID] = cur.QCStateId;
                return acc;
            }, {});

            return listItems.map((item: any) => {
                let responseObj: any = {};
                try {
                    responseObj = item?.Response ? JSON.parse(item.Response) : {};
                } catch { }

                const submittedBy = responseObj?.submittedBy || {};
                const siteLookup = item?.SiteName?.[0] || {};

                const stateId = siteDict[Number(siteLookup.lookupId)] || "";

                const submissionDate = item?.['SubmissionDate.'];

                return {
                    Id: Number(item.ID),
                    ID: Number(item.ID),
                    HazardType: item.HazardType || "",
                    HazardSubType: item.HazardSubType || "",
                    SiteName: siteLookup?.lookupValue,
                    SiteNameId: siteLookup?.lookupId,
                    SubmittedBy: submittedBy?.name || "",
                    SubmittedById: submittedBy?.email || "",
                    HazardFormId: item?.HazardFormId,
                    SubmissionDate: submissionDate ? formatSPDateToLocalDate(submissionDate) : "",
                    SubmissionDateDisplay: submissionDate ? formatSPDateToLocal(submissionDate, true) : "",
                    ResponseJSON: responseObj,
                    State: item?.StateName,
                    IsArchive: item.IsArchive === "Yes",
                    SubmissionTimestamp: submissionDate ? new Date(submissionDate).getTime() : 0,
                    stateId
                };
            });
        } catch (error) {
            console.error("Error in mapping data:", error);
            return [];
        }
    };


    const getHazardResponseData = async (siteItems: any[]) => {
        try {

            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: HazardFields.Status,
                    fieldValue: "Submitted",
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                },
                {
                    fieldName: HazardFields.IsArchive,
                    fieldValue: false,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                },
                {
                    fieldName: HazardFields.IsDeleted,
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.NotEqualTo
                }
            ];

            if (state.filterFromDate && state.filterToDate) {
                const dateField = HazardFields.SubmissionDate;
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${state.filterFromDate}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${state.filterToDate}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            } else {
                const endDate = moment().format('YYYY-MM-DD');
                const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
                const dateField = HazardFields.SubmissionDate;
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

            // if (props?.loginUserRoleDetails?.isAdmin === false && props?.loginUserRoleDetails?.isStateManager === true) {
            //     if (props?.loginUserRoleDetails?.currentUserAllCombineSites && props?.loginUserRoleDetails?.currentUserAllCombineSites?.length > 0) {
            //         filterFieldsSite.push({
            //             fieldName: `SiteName`,
            //             fieldValue: props?.loginUserRoleDetails?.currentUserAllCombineSites,
            //             fieldType: FieldType.LookupById,
            //             LogicalType: LogicalType.In
            //         });
            //     }
            // }

            const camlQuery = new CamlBuilder()
                .View([
                    HazardFields.Id,
                    HazardFields.SiteName,
                    HazardFields.HazardType,
                    HazardFields.HazardSubType,
                    HazardFields.Response,
                    HazardFields.IsArchive,
                    HazardFields.SubmittedBy,
                    HazardFields.HazardFormId,
                    HazardFields.SubmissionDate,
                    HazardFields.StateName
                ])
                .LeftJoin("SiteName", "SiteName").
                Select('StateNameValue', "StateName").
                Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();

            const categoriesExpressions = getCAMLQueryFilterExpression(filterFields);
            if (categoriesExpressions.length > 0) {
                camlQuery.Where().All(categoriesExpressions);
            }
            camlQuery.OrderByDesc('Modified');
            const localResponse = await provider.getItemsByCAMLQuery(ListNames.HazardFormResponses, camlQuery.ToString(), null, "");

            let listItems = mappingHazardData(localResponse, siteItems);
            const { isAdmin, isSiteManager, isStateManager, isSiteSupervisor, isUser, isWHSChairperson, whsChairpersonsStateId } = currentUserRoleDetail
            if (isAdmin || isSiteManager || isStateManager || isSiteSupervisor || isUser) {

            } else if (isWHSChairperson && whsChairpersonsStateId.length > 0) {
                listItems = listItems.filter((i) => !!i.stateId && whsChairpersonsStateId.includes(i.stateId))
            }
            return listItems;

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "getHazardResponseData", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            return []

        }
    };

    const getFilteredHazardData = (state: any, hazardItems: any[]) => {
        try {
            let filterhazardResponseItems: any[] = hazardItems || [];
            if (state.selectedStates?.length > 0) {
                filterhazardResponseItems = filterhazardResponseItems.filter(
                    (i) => !!i.State && state.selectedStates.includes(i.State)
                );
            }

            if (state.selectedSiteIds?.length > 0) {
                filterhazardResponseItems = filterhazardResponseItems.filter(
                    (i) => !!i.SiteNameId && state.selectedSiteIds.includes(i.SiteNameId)
                );
            }

            if (state.selectedHazardType?.length > 0) {
                filterhazardResponseItems = filterhazardResponseItems.filter(
                    (i) => !!i.HazardType && state.selectedHazardType.includes(i.HazardType)
                );
            }

            if (state.selectedSubHazardType?.length > 0) {
                filterhazardResponseItems = filterhazardResponseItems.filter(
                    (i) => state.selectedSubHazardType.includes(i.HazardSubType)
                );
            }

            if (state.selectedSubmittedBy?.length > 0) {
                filterhazardResponseItems = filterhazardResponseItems.filter(
                    (i) => state.selectedSubmittedBy.includes(i.SubmittedById)
                );
            }

            return { filterhazardResponseItems };
        } catch (error) {
            console.error(error);
            return {
                filterhazardResponseItems: []
            };
        }
    };

    const getHazardFileContent = async () => {
        try {
            const fileName = `${context.pageContext.web.serverRelativeUrl}/HazardReportForm/HazardReportForm.json`;
            const fileContent = await provider.readFileContent(fileName, 'json');
            return fileContent || '';
        } catch (err) {
            console.warn('Could not load hazard file content', err);
            return '';
        }
    }

    React.useEffect(() => {
        // if (!!state.filterToDate && !!state.filterFromDate && state.isDateFilterChange && state.isRefresh) {
        if (!!state.filterToDate && !!state.filterFromDate && state.isDateFilterChange && state.isRefresh) {
            (async () => {
                setIsLoading(true);
                try {
                    const hazardResponseData = await getHazardResponseData(siteData.current);
                    const siteIdToQCStateMap = new Map<string, string>(
                        siteData?.current?.map((item: { ID: any; QCStateId: any; }) => [item.ID, item.QCStateId])
                    ); const groupedByQCState: any = hazardResponseData.reduce((acc: any, item: any) => {
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
                    const { filterhazardResponseItems } = getFilteredHazardData(state, hazardResponseData);
                    const chartData = {
                        State: buildStateWiseData(filterhazardResponseItems),
                        SiteName: buildSiteWiseData(filterhazardResponseItems),
                        HazardType: buildHazardWiseData(filterhazardResponseItems),
                        HazardSubType: buildSubHazardWiseData(filterhazardResponseItems),
                        SubmissionDate: buildSubmissionDateWiseData(filterhazardResponseItems),
                    };

                    setState((prevState: any) => ({
                        ...prevState,
                        isLoading: false,
                        hazardResponseItems: hazardResponseData,
                        filterhazardResponseItems: filterhazardResponseItems,
                        keyUpdate: Date.now(),
                        isDateFilterChange: false,
                        isRefresh: false,
                        chartKeyUpdate: Date.now(),
                        SubmittedByOptions: buildUniqueOptions(hazardResponseData, "SubmittedBy", "SubmittedById"),
                        HazardTypeOptions: buildUniqueOptions(hazardResponseData, "HazardType"),
                        SubHazardTypeOptions: buildUniqueOptions(hazardResponseData, "HazardSubType"),
                        gridGroupingData: buildExcelGroupings(filterhazardResponseItems),
                        chartGroupingData: chartData,
                        stateCountData: groupedCountArray
                    }));
                    calculateHazardCounts(hazardResponseData, state.hazardFileContent);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            })();
        } else if (didMount.current && !state.isDateFilterChange && state.isRefresh) {
            try {
                const { filterhazardResponseItems } = getFilteredHazardData(state, state.hazardResponseItems);
                const chartData = {
                    State: buildStateWiseData(filterhazardResponseItems),
                    SiteName: buildSiteWiseData(filterhazardResponseItems),
                    HazardType: buildHazardWiseData(filterhazardResponseItems),
                    HazardSubType: buildSubHazardWiseData(filterhazardResponseItems),
                    SubmissionDate: buildSubmissionDateWiseData(filterhazardResponseItems),
                };
                setState((prevState: any) => ({
                    ...prevState,
                    filterhazardResponseItems: filterhazardResponseItems,
                    keyUpdate: Date.now(),
                    isRefresh: false,
                    chartKeyUpdate: Date.now(),
                    gridGroupingData: buildExcelGroupings(filterhazardResponseItems),
                    chartGroupingData: chartData
                }));
                setIsLoading(false);
            } catch (error) {
                console.log(error);
            }
        } else {
            didMount.current = true
        }
    }, [state.isRefresh]);

    const _userActivityLog = async () => {
        try {

            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityType eq '${UserActionEntityTypeEnum.HazardReport}' and ActionType eq '${UserActivityActionTypeEnum.ViewChart}' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data: any) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    ActionType: UserActivityActionTypeEnum.ViewChart,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.HazardReport,
                    EntityName: UserActionEntityTypeEnum.HazardReportChart,
                    LogFor: UserActionLogFor.Both,
                    Count: 1,
                    Details: "Viewed Charts for All Sites",
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            // setIsLoading(false);
        }
    };

    const calculateHazardCounts = (listItems: any[], fileContent: any) => {

        const finalArray = fileContent?.hazardSection?.hazards.map((fc: any) => {
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
        }).sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        hazardCountCard.current = finalArray;
    };

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const sitesMasterData = await _siteData2(provider);
                const [fileContent, hazardResponseData] = await Promise.all([getHazardFileContent(), getHazardResponseData(sitesMasterData)]);
                const siteIdToQCStateMap = new Map<string, string>(
                    sitesMasterData?.map((item: { ID: any; QCStateId: any; }) => [item.ID, item.QCStateId])
                ); const groupedByQCState: any = hazardResponseData.reduce((acc: any, item: any) => {
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
                const chartData = {
                    State: buildStateWiseData(hazardResponseData),
                    SiteName: buildSiteWiseData(hazardResponseData),
                    HazardType: buildHazardWiseData(hazardResponseData),
                    HazardSubType: buildSubHazardWiseData(hazardResponseData),
                    SubmissionDate: buildSubmissionDateWiseData(hazardResponseData),
                };
                siteData.current = sitesMasterData;
                setState((prevState: any) => ({
                    ...prevState, isLoading: false,
                    hazardFileContent: fileContent,
                    hazardResponseItems: hazardResponseData,
                    filterhazardResponseItems: hazardResponseData,
                    gridGroupingData: buildExcelGroupings(hazardResponseData),
                    keyUpdate: Math.random(),
                    SubmittedByOptions: buildUniqueOptions(hazardResponseData, "SubmittedBy", "SubmittedById"),
                    HazardTypeOptions: buildUniqueOptions(hazardResponseData, "HazardType"),
                    SubHazardTypeOptions: buildUniqueOptions(hazardResponseData, "HazardSubType"),
                    chartGroupingData: chartData,
                    stateCountData: groupedCountArray
                }));
                calculateHazardCounts(hazardResponseData, fileContent);
                setIsLoading(false);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            }
            _userActivityLog();
        })();
    }, []);

    // React.useEffect(() => {
    //     console.log('filterhazardResponseItems', state.filterhazardResponseItems);

    // }, [state.filterhazardResponseItems])

    const handleSearch = () => {
        setState((prevState: any) => ({ ...prevState, isRefresh: true }));
        // updateDataWithFilter(); // will use current dataState filters
    };

    const handleReset = () => {
        const resetFilters = {
            ...state,
            SubmittedByOptions: [],
            selectedSubmittedBy: [],
            selectedSubmittedByFull: [],
            selectedSubHazardType: [],
            SubHazardTypeOptions: [],
            selectedHazardType: [],
            HazardTypeOptions: [],
            selectedStatesId: [],
            selectedSiteTitles: [],
            selectedItem: { key: 'Last 7 Days', text: 'Last 7 Days' },
            hazardResponseItems: [],
            filterhazardResponseItems: [],
            selectedSCSites: [],
            selectedSiteIds: [],
            selectedStates: [],
            keyUpdate: Math.random(),
            stateKeyUpdate: Math.random(),
            toggleKeyUpdate: Math.random(),
            fromDate: "",
            toDate: "",
            filterFromDate: moment(new Date()).subtract(6, 'days').format(defaultValues.FilterDateFormate),
            filterToDate: moment(new Date()).format(defaultValues.FilterDateFormate),
            topNumber: 10,
            bottomNumber: 10,
            isDateFilterChange: true,
            isRefresh: true,
            isPDFGenerating: false,
            gridGroupingData: {},
            chartGroupingData: {},
            stateCountData: [],
            stateTabData: [],
            selectedHazardItem: undefined
        };

        setState(prev => ({ ...prev, ...resetFilters }));
    };

    // Send email 
    const generatePDF = () => {
        let fileName: string = generatePdfFileName(`HazardReport`);

        setIsLoading(true);
        setState((prev: any) => ({ ...prev, isPDFGenerating: true }));
        setTimeout(async () => {
            try {
                await generateAndSaveKendoPDFForReports("reports-id", fileName, false, true);
            } finally {
                setState((prev: any) => ({ ...prev, isPDFGenerating: false }));
                setIsLoading(false);
            }
        }, 1000);

    };

    const resetForm = (): void => {
        setEmailState({
            title: "",
            sendToEmail: "",
            displayErrorTitle: false,
            displayErrorEmail: false,
            displayError: false,
        });
    };

    const onClickCancelEmailPopup = (): void => {
        resetForm();
        hideEmailPopup();
    };
    const onClickSendEmail = async (type: 'PDF' | 'Excel'): Promise<void> => {
        // console.log("Sending as:", type)
        setIsLoading(true);
        setState((prev: any) => ({ ...prev, isPDFGenerating: true }));
        const isTitleEmpty = !emailState.title?.trim();
        const isEmailEmpty = !emailState.sendToEmail?.trim();
        const isEmailInvalid = !isEmailEmpty && !emailState.sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
        setEmailState(prev => ({
            ...prev,
            displayErrorTitle: isTitleEmpty,
            displayErrorEmail: isEmailEmpty,
            displayError: isEmailInvalid,
        }));

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {

            let fileName: string = generatePdfFileName(`HazardReport`);
            // setShowPdfView(true);
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFForReports("reports-id", fileName, false, false);

                // setShowPdfView(false);
                const file: IFileWithBlob = {
                    file: fileblob,
                    name: `${fileName}.pdf`,
                    overwrite: true
                };
                let toastMessage: string = "";
                const toastId = toastService.loading('Sending...');
                toastMessage = 'Email sent successfully!';
                const insertData: any = {
                    Title: emailState.title?.trim(),
                    SendToEmail: emailState.sendToEmail?.trim(),
                    // ReportName: state.selectedMenu.DisplayName?.trim(),
                    ReportName: 'Hazard Report',
                    // StateName: state || "All State",
                    SiteName: "All Site",
                    EmailType: "HazardReportPDF"
                };
                provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                    provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                        const logObj = {
                            UserName: currentUserRoleDetail?.title,
                            ActionType: UserActivityActionTypeEnum.SendEmail,
                            EntityType: UserActionEntityTypeEnum.HazardReport,
                            EntityName: UserActionEntityTypeEnum.HazardReportChart,
                            Details: `Sent Hazard Report Charts to ${emailState?.title}`,
                            LogFor: UserActionLogFor.Both,
                            Email: currentUserRoleDetail?.emailId,
                            Count: 1,
                        };
                        void UserActivityLog(provider, logObj, currentUserRoleDetail);
                    }).catch((err: any) => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onClickCancelEmailPopup();
                    setIsLoading(false);
                    document.querySelectorAll(`#reports-id .noExport`).forEach((el: Element) => {
                        if (el instanceof HTMLElement) {
                            el.style.display = "block";
                        }
                    });
                    setState((prev: any) => ({ ...prev, isPDFGenerating: false }));
                }).catch((err: any) => console.log(err));
            }, 1000);
        } else {
            setIsLoading(false);
        }
    };

    const onclickSendEmailPopup = () => {
        showEmailPopup();
    };

    const updateFormState = (key: keyof typeof emailState, value: any) => {
        setEmailState(prev => ({ ...prev, [key]: value }));
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        updateFormState("title", newValue || "");
        if (newValue) updateFormState("displayErrorTitle", false);
    };

    const onChangeSendToEmail = (
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ): void => {
        const value = newValue || "";
        updateFormState("sendToEmail", value);

        if (value) updateFormState("displayErrorEmail", false);

        const emailPattern =
            /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        updateFormState("displayError", !(!value || emailPattern.test(value)));
    };

    return {
        isCollapsed,
        state,
        isFilterHide,
        toggleSidebar,
        menuItems,
        onClickLeftNavigation,
        onRenderComponent,
        provider,
        context,
        isPdfMode,
        currentUserRoleDetail,
        handleReset,
        handleSearch,
        handleDropdownChange,
        isLoading,
        generatePDF,
        isEmailPopupVisible,
        onclickSendEmailPopup,
        onClickSendEmail,
        emailState,
        hideEmailPopup,
        onChangeTitle,
        onChangeSendToEmail,
        onClickCancelEmailPopup,
        setState,
        onStateChange,
        handleSiteChange,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        exportMenuProps,
        hazardCountCard,
        showDetails,
        handleCardClick
    };
};
