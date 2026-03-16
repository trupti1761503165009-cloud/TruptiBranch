/* eslint-disable */
import { IContextualMenuProps, IDropdownOption } from "@fluentui/react";
import { useAtom } from "jotai";
import moment from "moment";
import * as React from "react";
import { useState } from "react";
import { useBoolean } from '@fluentui/react-hooks';
import {
    faChartPie,
    faHome,
    faMapMarkedAlt,
    faBuilding,
    faTags,
    faSitemap,
    faCalendarDays, faListAlt,
    faChartLine,
    faUsers,
    faDashboard
} from "@fortawesome/free-solid-svg-icons";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { defaultValues, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, UserActionLogFor } from "../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../Common/ToastService";
import { logGenerator, getCAMLQueryFilterExpression, generateAndSaveKendoPDFForReports, UserActivityLog } from "../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { generateExcelClientReport, generateGenericCRExcel, formatSPDateToLocalDate, formatSPDateToLocal, buildUniqueOptions, buildExcelGroupingsClientResponse, generatePdfFileName, buildSiteCategoryTabs, groupResponseByQCState, getIconUrl, generateCommonExcelFileName, getJSONFileContent } from "../../CommonComponents/CommonMethods";
import { ClientResponseFields, CRGridTitles, ClientResponseChartMenuEnum, ClientResponseEnum, ClientResponseViewFields } from "../QRClientResponse/ClientResponseFields";
import { NO_SITE_CATEGORY_ID } from "../../../../../Common/Constants/CommonConstants";
import { DashboardIssueList } from "./CRIssues/DashboardIssueList";
import { ViewClientResponseFormDetail } from "../QRClientResponse/IssuesList/ViewClientResponseFormDetail";
import CRDashboardBarChart, { buildCategoryWiseCRData, buildSiteWiseCRData, buildStateWiseCRData, buildSubCategoryWiseCRData, buildSubmissionDateWiseCRData } from "./DashboardCharts/CRDashboardChart";
import CRDashboardSiteWiseBarChart from "./DashboardCharts/CRDashboardSiteWiseChart";
import CategorySubCategoryLineChart from "./DashboardCharts/CategorySubCategoryLineChart";
import SubCategoryCountsByUser from "./DashboardCharts/SubCategoryCountsByUser";
import SubCategoryCountsByCategory from "./DashboardCharts/SubCategoryCountsByCategory";
import { CRMasterDataGrid } from "./CRStateWiseChart/CRMasterDataGrid";
import StateWiseCategoryChart from "./CRStateWiseChart/StateWiseCategoryChart";
import { StateWiseCategoryGrid } from "./CRStateWiseChart/StateWiseCategoryGrid";
import { CRDashboardGrid } from "./DashboardCharts/CRDashboardGrid";
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
export interface IDataState {
    selectedMenu: { key: string, DisplayName: string };
    ReportedByOptions: any[];
    selectedReportedBy: any;
    selectedSubCategory: any;
    SubCategoryOptions: any[];
    selectedCategory: any;
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
    clientResponseItems: any[];
    filterClientResponseItems: any[];
    keyUpdate: number;
    toggleKeyUpdate: number;
    stateKeyUpdate: number;
    topNumber: any;
    bottomNumber: any;
    isDateFilterChange: boolean;
    jsonFileContent: any;
    isRefresh: boolean;
    isPDFGenerating?: boolean;
    gridGroupingData: any;
    chartGroupingData: any;
    stateCountData: any;
    stateTabData: any;
    isViewDetail: any;
    selectedResponseItem: any;
    selectedSiteCategoryId: any;
    SiteCategoryCardData: any;
    JSONFiles: any[];
    isCategoryChange: boolean;
}

export const ClientResponseChartDashboardData = (props: any) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [appGlobalState, setAppGlobalState] = useAtom(appGlobalStateAtom);
    const didMount = React.useRef(false);

    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState(true);
    const categoryCountCard = React.useRef<any[]>([]);
    let siteData = React.useRef<any>([]);
    const [isEmailPopupVisible, { setTrue: showEmailPopup, setFalse: hideEmailPopup }] = useBoolean(false);
    const [gridView, setGridView] = useState("grid");
    const [emailState, setEmailState] = React.useState({
        title: "",
        sendToEmail: "",
        displayErrorTitle: false,
        displayErrorEmail: false,
        displayError: false,
    });
    const [state, setState] = React.useState<IDataState>({
        selectedMenu: { key: ClientResponseChartMenuEnum.Grid, DisplayName: CRGridTitles.ClientResponseRecords },
        isLoading: false,
        ReportedByOptions: [],
        selectedReportedBy: [],
        selectedSubCategory: [],
        SubCategoryOptions: [],
        selectedCategory: [],
        selectedStatesId: [],
        selectedSiteTitles: [],
        selectedItem: { key: 'Last 7 Days', text: 'Last 7 Days' },
        clientResponseItems: [],
        filterClientResponseItems: [],
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
        jsonFileContent: '',
        isPDFGenerating: false,
        gridGroupingData: {},
        chartGroupingData: {},
        stateCountData: [],
        stateTabData: [],
        isViewDetail: false,
        selectedResponseItem: undefined,
        selectedSiteCategoryId: undefined,
        SiteCategoryCardData: [],
        JSONFiles: [],
        isCategoryChange: true
    });

    const [showDetails, setShowDetails] = React.useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
        setState((prevState: any) => ({ ...prevState, toggleKeyUpdate: Math.random() }));
    };

    const onClickLeftNavigation = (key: string, tooltip: string) => {
        setState((prevState) => ({ ...prevState, selectedMenu: { key: key, DisplayName: tooltip }, keyUpdate: Math.random() }));
    };

    // Menu Items for Cleaner Checklist Reports
    const menuItems = [
        {
            label: CRGridTitles.ClientResponseReports,
            tooltip: CRGridTitles.ClientResponseReports,
            icon: faHome,
            key: ClientResponseChartMenuEnum.Grid,
            DisplayName: CRGridTitles.ClientResponseReports
        },
        {
            label: CRGridTitles.ClientResponseReports,
            tooltip: CRGridTitles.ClientResponseReports,
            icon: faDashboard,
            key: ClientResponseChartMenuEnum.Dashboard,
            DisplayName: CRGridTitles.ClientResponseReports
        },
        {
            label: CRGridTitles.ClientResponseMasterReport,
            tooltip: CRGridTitles.ClientResponseMasterReport,
            icon: faChartPie,
            key: ClientResponseChartMenuEnum.MasterReport,
            DisplayName: CRGridTitles.ClientResponseMasterReport
        },
        {
            label: CRGridTitles[ClientResponseFields.State],
            tooltip: CRGridTitles[ClientResponseFields.State],
            icon: faMapMarkedAlt,
            key: ClientResponseChartMenuEnum.StateWiseResponse,
            DisplayName: CRGridTitles[ClientResponseFields.State]
        },
        {
            label: CRGridTitles[ClientResponseFields.SiteName],
            tooltip: CRGridTitles[ClientResponseFields.SiteName],
            icon: faBuilding,
            key: ClientResponseChartMenuEnum.SiteWiseResponse,
            DisplayName: CRGridTitles[ClientResponseFields.SiteName]
        },
        {
            label: CRGridTitles[ClientResponseFields.Category],
            tooltip: CRGridTitles[ClientResponseFields.Category],
            icon: faTags,
            key: ClientResponseChartMenuEnum.CategoryWiseReport,
            DisplayName: CRGridTitles[ClientResponseFields.Category]
        },
        {
            label: CRGridTitles[ClientResponseFields.SubCategory],
            tooltip: CRGridTitles[ClientResponseFields.SubCategory],
            icon: faSitemap,
            key: ClientResponseChartMenuEnum.SubCategoryWiseReport,
            DisplayName: CRGridTitles[ClientResponseFields.SubCategory]
        },
        {
            label: CRGridTitles[ClientResponseFields.SubmissionDate],
            tooltip: CRGridTitles[ClientResponseFields.SubmissionDate],
            icon: faCalendarDays,
            key: ClientResponseChartMenuEnum.SubmissionDateWiseReport,
            DisplayName: CRGridTitles[ClientResponseFields.SubmissionDate]
        },
        {
            label: CRGridTitles[ClientResponseFields.ReportedBy],
            tooltip: CRGridTitles[ClientResponseFields.ReportedBy],
            icon: faUsers,
            key: ClientResponseChartMenuEnum.UserWiseSubCategory,
            DisplayName: CRGridTitles[ClientResponseFields.ReportedBy]
        },
        {
            label: CRGridTitles.SubCategoryByCategory,
            tooltip: CRGridTitles.SubCategoryByCategory,
            icon: faListAlt,
            key: ClientResponseChartMenuEnum.SubCategoryByResponse,
            DisplayName: CRGridTitles.SubCategoryByCategory
        },
        {
            label: CRGridTitles.SubCategoryByCategoryTrend,
            tooltip: CRGridTitles.SubCategoryByCategoryTrend,
            icon: faChartLine,
            key: ClientResponseChartMenuEnum.SubCategoryByResponseTrend,
            DisplayName: CRGridTitles.SubCategoryByCategoryTrend
        },
    ];

    const onExportToExcelClick = () => {
        let fileName = "";

        switch (state.selectedMenu.key) {

            case ClientResponseChartMenuEnum.Dashboard:
                fileName = generateCommonExcelFileName("Dashboard");
                generateExcelClientReport(state.filterClientResponseItems, undefined, fileName);
                break;

            case ClientResponseChartMenuEnum.MasterReport:
                fileName = generateCommonExcelFileName("Master");
                generateExcelClientReport(state.filterClientResponseItems, undefined, fileName);
                break;

            case ClientResponseChartMenuEnum.StateWiseResponse:
                fileName = generateCommonExcelFileName("StateWise", "CR");
                generateGenericCRExcel(state.gridGroupingData?.byState, ClientResponseFields.State, fileName);
                break;

            case ClientResponseChartMenuEnum.SiteWiseResponse:
                fileName = generateCommonExcelFileName("SiteWise", "CR");
                generateGenericCRExcel(state.gridGroupingData?.bySite, ClientResponseFields.SiteName, fileName);
                break;

            case ClientResponseChartMenuEnum.CategoryWiseReport:
                fileName = generateCommonExcelFileName("CategoryeWise", "CR");
                generateGenericCRExcel(state.gridGroupingData?.byCategory, ClientResponseFields.Category, fileName);
                break;

            case ClientResponseChartMenuEnum.SubCategoryWiseReport:
                fileName = generateCommonExcelFileName("SubCategoryTypeWise", "CR");
                generateGenericCRExcel(state.gridGroupingData?.bySubCategory, ClientResponseFields.SubCategory, fileName);
                break;

            case ClientResponseChartMenuEnum.SubmissionDateWiseReport:
                fileName = generateCommonExcelFileName("SubmissionDateWise", "CR");
                generateGenericCRExcel(state.gridGroupingData?.bySubmission, ClientResponseFields.SubmissionDate, fileName);
                break;
            case ClientResponseChartMenuEnum.UserWiseSubCategory:
                fileName = generateCommonExcelFileName("UserWise", "CR");
                generateGenericCRExcel(state.gridGroupingData?.byReportedBy, ClientResponseFields.ReportedBy, fileName);
                break;
            case ClientResponseChartMenuEnum.SubCategoryByResponse:
                fileName = generateCommonExcelFileName("SubCategoryByFeedback", "CR");
                generateGenericCRExcel(state.gridGroupingData?.byCategory, ClientResponseFields.Category, fileName);
                break;
            case ClientResponseChartMenuEnum.SubCategoryByResponseTrend:
                fileName = generateCommonExcelFileName("SubCategoryCountByFeedback", "CR");
                generateGenericCRExcel(state.gridGroupingData?.byCategory, ClientResponseFields.Category, fileName);
                break;
            default:
                fileName = generateCommonExcelFileName("Dashboard", "CR");
                generateExcelClientReport(state.filterClientResponseItems, undefined, fileName);
        }
    };

    const exportMenuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { generatePDF() },
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

    const handleViewDetails = (reponseId: number) => {
        setState((prevState: any) => ({ ...prevState, selectedResponseItem: reponseId }));
        setShowDetails(true);
    };

    const handleBack = () => {
        setShowDetails(false);
        setState((prevState: any) => ({ ...prevState, selectedResponseItem: null }));
    };

    const onRenderComponent = () => {
        switch (state.selectedMenu.key) {
            case ClientResponseChartMenuEnum.Grid:
                return (
                    <div key={state.keyUpdate}>
                        {!showDetails ? (
                            <DashboardIssueList
                                responseData={state.filterClientResponseItems}
                                onViewDetails={handleViewDetails}
                                onItemUpdated={handleUpdate}
                                view={gridView}
                                onViewChange={setGridView}
                                componentProps={props.componentProps}
                            />
                        ) : (
                            <ViewClientResponseFormDetail
                                loginUserRoleDetails={currentUserRoleDetail}
                                provider={provider}
                                context={context}
                                responseFormId={state.selectedResponseItem}
                                componentProps={props.componentProps}
                                onBack={handleBack}
                                isChartView={true}
                            />
                        )}
                    </div>
                );

            case ClientResponseChartMenuEnum.Dashboard:
                return <div key={state.keyUpdate}>
                    <CRDashboardBarChart
                        key={`state-${state.keyUpdate}`}
                        title={ClientResponseEnum.StateWiseCount}
                        data={state?.chartGroupingData?.State}
                        level={ClientResponseFields.State}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />

                    <div className="page-break"></div>
                    <CRDashboardSiteWiseBarChart
                        key={`site-${state.keyUpdate}`}
                        title={ClientResponseEnum.SiteWiseCount}
                        data={state?.chartGroupingData?.SiteName}
                        level={ClientResponseFields.SiteName}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />

                    <div className="page-break"></div>
                    <CRDashboardBarChart
                        key={`category-${state.keyUpdate}`}
                        title={ClientResponseEnum.CategoryWiseCount}
                        data={state?.chartGroupingData?.Category}
                        level={ClientResponseFields.Category}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />

                    <div className="page-break"></div>
                    <CRDashboardBarChart
                        key={`subcategory-${state.keyUpdate}`}
                        title={ClientResponseEnum.SubCategoryWiseCount}
                        data={state?.chartGroupingData?.SubCategory}
                        level={ClientResponseFields.SubCategory}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />

                    <div className="page-break"></div>

                    <CRDashboardBarChart
                        key={`submissiondate-${state.keyUpdate}`}
                        title={ClientResponseEnum.SubmissionDateWiseCount}
                        data={state?.chartGroupingData?.SubmissionDate}
                        level={ClientResponseFields.SubmissionDate}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />
                    <div className="page-break"></div>

                    <SubCategoryCountsByUser
                        key={`usersubcategory-${state.keyUpdate}`}
                        data={state?.filterClientResponseItems}
                        height="500px"
                        title={ClientResponseEnum.UserWiseCount}
                    />
                    <div className="page-break"></div>
                    <SubCategoryCountsByCategory
                        key={`subcategorybar-${state.keyUpdate}`}
                        data={state?.filterClientResponseItems}
                        title={ClientResponseEnum.SubCategoryByCategory}
                        height="500px"
                    />

                    <div className="page-break"></div>
                    <div className="mb-5">
                        <CategorySubCategoryLineChart
                            key={`category-line-chart-${state.keyUpdate}`}
                            data={state?.filterClientResponseItems}
                            title={ClientResponseEnum.SubCategoryByCategory}
                            height="500px"
                        />
                    </div>

                </div>
            case ClientResponseChartMenuEnum.MasterReport:
                return <div key={state.keyUpdate}>
                    <StateWiseCategoryChart
                        data={state.filterClientResponseItems}
                    />
                    <div className="page-break"></div>
                    {state.isPDFGenerating ? <CRMasterDataGrid data={state.filterClientResponseItems} />
                        :
                        <StateWiseCategoryGrid
                            data={state.filterClientResponseItems}
                            isPDFGenerating={state.isPDFGenerating}
                        />}
                </div>
            case ClientResponseChartMenuEnum.StateWiseResponse:
                return <div key={state.keyUpdate}>
                    <CRDashboardBarChart
                        title={ClientResponseEnum.StateWiseCount}
                        data={state?.chartGroupingData?.State}
                        level={ClientResponseFields.State}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />

                    <div className="page-break"></div>
                    <CRDashboardGrid
                        data={state?.gridGroupingData?.byState}
                        groupBy={ClientResponseFields.State}
                        title={CRGridTitles[ClientResponseFields.State]}
                        groupDisplayName={ClientResponseViewFields.State}
                        isPDFGenerating={state.isPDFGenerating}
                    // isPDFGenerating={fals}
                    />

                </div>
            case ClientResponseChartMenuEnum.SiteWiseResponse:
                return <div key={state.keyUpdate}>
                    <CRDashboardSiteWiseBarChart
                        title={ClientResponseEnum.SiteWiseCount}
                        data={state?.chartGroupingData?.SiteName}
                        level={ClientResponseFields.SiteName}
                        {...(state.isPDFGenerating && {
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.bySite}
                        groupBy={ClientResponseFields.SiteName}
                        title={CRGridTitles[ClientResponseFields.SiteName]}
                        groupDisplayName={ClientResponseViewFields.SiteName}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case ClientResponseChartMenuEnum.CategoryWiseReport:
                return <div key={state.keyUpdate}>
                    <CRDashboardBarChart
                        title={ClientResponseEnum.CategoryWiseCount}
                        data={state?.chartGroupingData?.Category}
                        level={ClientResponseFields.Category}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.byCategory}
                        groupBy={ClientResponseFields.Category}
                        title={CRGridTitles[ClientResponseFields.Category]}
                        groupDisplayName={ClientResponseViewFields.Category}
                        isPDFGenerating={state.isPDFGenerating}
                    />

                </div>
            case ClientResponseChartMenuEnum.SubCategoryWiseReport:
                return <div key={state.keyUpdate}>
                    <CRDashboardBarChart
                        title={ClientResponseEnum.SubCategoryWiseCount}
                        data={state?.chartGroupingData?.SubCategory}
                        level={ClientResponseFields.SubCategory}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.bySubCategory}
                        groupBy={ClientResponseFields.SubCategory}
                        title={CRGridTitles[ClientResponseFields.SubCategory]}
                        groupDisplayName={ClientResponseViewFields.SubCategory}
                        isPDFGenerating={state.isPDFGenerating}
                    />

                </div>
            case ClientResponseChartMenuEnum.SubmissionDateWiseReport:
                return <div key={state.keyUpdate}>
                    <CRDashboardBarChart
                        title={ClientResponseEnum.SubmissionDateWiseCount}
                        data={state?.chartGroupingData?.SubmissionDate}
                        level={ClientResponseFields.SubmissionDate}
                        {...(state.isPDFGenerating && {
                            // width: 800,
                            height: "550px",
                            isPDFGenerating: true,
                            width: '1350px'
                        })}
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.bySubmission}
                        groupBy={ClientResponseFields.SubmissionDate}
                        title={CRGridTitles[ClientResponseFields.SubmissionDate]}
                        groupDisplayName={ClientResponseViewFields.SubmissionDate}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case ClientResponseChartMenuEnum.UserWiseSubCategory:
                return <div key={state.keyUpdate}>
                    <SubCategoryCountsByUser
                        data={state?.filterClientResponseItems}
                        height="500px"
                        title={ClientResponseEnum.UserWiseCount}
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.byReportedBy}
                        groupBy={ClientResponseFields.ReportedBy}
                        title={CRGridTitles[ClientResponseFields.ReportedBy]}
                        groupDisplayName={ClientResponseViewFields.ReportedBy}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case ClientResponseChartMenuEnum.SubCategoryByResponse:
                return <div key={state.keyUpdate}>
                    <SubCategoryCountsByCategory
                        data={state?.filterClientResponseItems}
                        title={ClientResponseEnum.SubCategoryByCategory}
                        height="500px"
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.byCategory}
                        groupBy={ClientResponseFields.Category}
                        title={CRGridTitles[ClientResponseFields.Category]}
                        groupDisplayName={ClientResponseViewFields.Category}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            case ClientResponseChartMenuEnum.SubCategoryByResponseTrend:
                return <div key={state.keyUpdate}>
                    <CategorySubCategoryLineChart
                        data={state?.filterClientResponseItems}
                        title={ClientResponseEnum.SubCategoryByCategory}
                        height="500px"
                    />
                    <div className="page-break"></div>

                    <CRDashboardGrid
                        data={state?.gridGroupingData?.byCategory}
                        groupBy={ClientResponseFields.Category}
                        title={CRGridTitles[ClientResponseFields.Category]}
                        groupDisplayName={ClientResponseViewFields.Category}
                        isPDFGenerating={state.isPDFGenerating}
                    />
                </div>
            default:
                return <div>Select a report</div>;

        }
    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState((prevState) => ({
            ...prevState, filterToDate: filterDate, toDate: date, isDateFilterChange: true, isCategoryChange: true,
        }));
    };

    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState((prevState) => ({
            ...prevState, filterFromDate: filterDate, fromDate: date, isDateFilterChange: true, isCategoryChange: true,
        }));
    };

    const onChangeRangeOption = (item: IDropdownOption): void => {
        if ('Custom Range' == item.key) {
            setState((prevState) => ({
                ...prevState,
                selectedItem: item,
                filterFromDate: "",
                filterToDate: "",

            }))
        } else {
            setState((prevState) => ({
                ...prevState, selectedItem: item,
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

    const handleDropdownChange = (field: keyof IDataState, selected: any, isMulti: boolean = false, isRefreshOp?: any) => {
        const newValue = isMulti
            ? (selected ? selected.map((x: any) => x.value) : [])
            : (selected ? selected.value : null);

        setState(prev => ({
            ...prev,
            [field]: newValue
        }));
    };

    const handleCardClick = (title: any) => {
        // setIsLoading(true);
        if (title && title?.length > 0) {
            setState((prevState: any) => ({ ...prevState, selectedCategory: title, isRefresh: true }));
        } else {
            setState((prevState: any) => ({ ...prevState, selectedCategory: [], isRefresh: true }));
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

            const countLookup = Object.fromEntries(state.stateCountData.map((item: any) => [Number(item.Id), item.Count]));
            let stateItems: any[] = currentUserRoleDetail.stateMasterItems;

            const stateData = stateItems.map((title: any) => ({
                Id: title.Id,
                Count: countLookup[title.Id] || 0,
                Title: title.Title
            }));
            setState((prevState: any) => ({ ...prevState, stateTabData: stateData }))
        }
    }, [state.stateCountData])

    const mappingData = (listItems: any[], siteItems: any[]) => {
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

                const siteLookup = item?.SiteName?.[0] || {};
                const siteCategoryLookup = item?.SiteCategory?.[0] || {};
                const resolvedBy = item?.ResolvedBy?.[0] || {};

                const stateId = siteDict[Number(siteLookup.lookupId)] || "";

                const submissionDate = item?.['SubmissionDate.'];

                return {
                    Id: Number(item.ID),
                    ID: Number(item.ID),
                    Category: item.Category || "",
                    SubCategory: item.SubCategory || "",
                    SiteName: siteLookup?.lookupValue,
                    SiteNameId: siteLookup?.lookupId,
                    SiteCategory: siteCategoryLookup?.lookupValue,
                    SiteCategoryId: siteCategoryLookup?.lookupId ?? NO_SITE_CATEGORY_ID,
                    ReportedBy: item.ReportedBy || "Unknown",
                    ResolvedBy: resolvedBy.lookupValue ?? "",
                    ResolvedById: resolvedBy.lookupId ?? "",
                    ResponseFormId: item?.ResponseFormId,
                    SubmissionDate: submissionDate ? formatSPDateToLocalDate(submissionDate) : "",
                    SubmissionDateDisplay: submissionDate ? formatSPDateToLocal(submissionDate, true) : "",
                    ResolvedDate: item.ResolvedDate ? formatSPDateToLocal(item?.['ResolvedDate.'], true) : "",
                    ResponseJSON: responseObj,
                    State: item?.StateName,
                    Status: item.Status,
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

    const getClientResponseData = async (siteItems: any[]) => {
        try {

            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: ClientResponseFields.Status,
                    fieldValue: "Draft",
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.NotEqualTo
                },
                {
                    fieldName: ClientResponseFields.IsArchive,
                    fieldValue: false,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                },
                {
                    fieldName: ClientResponseFields.IsDeleted,
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.NotEqualTo
                }
            ];

            if (state.filterFromDate && state.filterToDate) {
                const dateField = ClientResponseFields.SubmissionDate;
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
                const dateField = ClientResponseFields.SubmissionDate;
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

            const camlQuery = new CamlBuilder()
                .View([
                    ClientResponseFields.Id,
                    ClientResponseFields.SiteName,
                    ClientResponseFields.Category,
                    ClientResponseFields.SubCategory,
                    ClientResponseFields.Response,
                    ClientResponseFields.IsArchive,
                    ClientResponseFields.ReportedBy,
                    ClientResponseFields.AssignedTo,
                    ClientResponseFields.ResolvedBy,
                    ClientResponseFields.ResponseFormId,
                    ClientResponseFields.SubmissionDate,
                    ClientResponseFields.StateName,
                    ClientResponseFields.SiteCategory,
                    ClientResponseFields.SiteCategoryName,
                    ClientResponseFields.Status,
                    ClientResponseFields.ResolvedDate
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
            const localResponse = await provider.getItemsByCAMLQuery(ListNames.ClientResponsesSubmission, camlQuery.ToString(), null, "");

            let listItems = mappingData(localResponse, siteItems);
            return listItems;

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "getClientResponseData", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            return []
        }
    };

    const getFilteredData = (state: any, items: any[]) => {
        try {
            let filterClientResponseItems: any[] = items || [];

            if (state.selectedStates?.length > 0) {
                filterClientResponseItems = filterClientResponseItems.filter(
                    (i) => !!i.State && state.selectedStates.includes(i.State)
                );
            }

            if (state.selectedSiteIds?.length > 0) {
                filterClientResponseItems = filterClientResponseItems.filter(
                    (i) => !!i.SiteNameId && state.selectedSiteIds.includes(i.SiteNameId)
                );
            }

            if (state.selectedCategory?.length > 0) {
                filterClientResponseItems = filterClientResponseItems.filter(
                    (i) => !!i.Category && state.selectedCategory.includes(i.Category)
                );
            }

            if (state.selectedSubCategory?.length > 0) {
                filterClientResponseItems = filterClientResponseItems.filter(
                    (i) => state.selectedSubCategory.includes(i.SubCategory)
                );
            }

            if (state.selectedReportedBy?.length > 0) {
                filterClientResponseItems = filterClientResponseItems.filter(
                    (i) => state.selectedReportedBy.includes(i.ReportedBy)
                );
            }

            return { filterClientResponseItems };
        } catch (error) {
            console.error(error);
            return {
                filterClientResponseItems: []
            };
        }
    };

    const generateSiteCategoryItems = (items: any[]) => {
        const categoryTabs = buildSiteCategoryTabs(items);
        const defaultSiteCategoryId = state.selectedSiteCategoryId ?? categoryTabs[0]?.Id;

        return { categoryTabs, defaultSiteCategoryId };
    };

    const _userActivityLog = async () => {
        try {

            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityType eq '${UserActionEntityTypeEnum.ClientResponse}' and ActionType eq '${UserActivityActionTypeEnum.ViewChart}' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                    EntityType: UserActionEntityTypeEnum.ClientResponse,
                    EntityName: UserActionEntityTypeEnum.ClientResponseReportChart,
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

    const calculateCardCounts = (listItems: any[], fileContent: any) => {

        const finalArray = fileContent?.categorySection?.categories.map((fc: any) => {
            const category = fc.name;
            const color = fc.color || "";
            const patterncolor = `${fc.color}60` || "";
            const bgcolor = `${fc.color}40` || "";
            const iconUrl = getIconUrl(fc.iconUrl, context) || "";

            const listCount = listItems.filter(item => item.Category === category).length;

            return {
                category,
                color,
                iconUrl,
                listCount,
                bgcolor,
                patterncolor,
                order: fc.order || 0
            };
        }).sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        categoryCountCard.current = finalArray;
    };

    React.useEffect(() => {
        if (!!state.filterToDate && !!state.filterFromDate && state.isDateFilterChange && state.isRefresh) {
            (async () => {
                setIsLoading(true);
                try {
                    const clientResponseData = await getClientResponseData(siteData.current);
                    const { categoryTabs, defaultSiteCategoryId } = generateSiteCategoryItems(clientResponseData);
                    const filterClientResponseData = clientResponseData.filter((i) => i.SiteCategoryId === defaultSiteCategoryId);

                    let fileContent = state.JSONFiles?.find((i) => i?.siteCategoryId === defaultSiteCategoryId);
                    const groupedCountArray = groupResponseByQCState(filterClientResponseData, siteData.current);
                    const { filterClientResponseItems } = getFilteredData(state, filterClientResponseData);
                    const chartData = {
                        State: buildStateWiseCRData(filterClientResponseItems),
                        SiteName: buildSiteWiseCRData(filterClientResponseItems),
                        Category: buildCategoryWiseCRData(filterClientResponseItems),
                        SubCategory: buildSubCategoryWiseCRData(filterClientResponseItems),
                        SubmissionDate: buildSubmissionDateWiseCRData(filterClientResponseItems),
                    };

                    setState((prevState: any) => ({
                        ...prevState,
                        isLoading: false,
                        clientResponseItems: clientResponseData,
                        filterClientResponseItems: filterClientResponseItems,
                        keyUpdate: Date.now(),
                        isDateFilterChange: false,
                        isRefresh: false,
                        isCategoryChange: false,
                        chartKeyUpdate: Date.now(),
                        ReportedByOptions: buildUniqueOptions(filterClientResponseData, "ReportedBy"),
                        SubCategoryOptions: buildUniqueOptions(filterClientResponseData, "SubCategory"),
                        gridGroupingData: buildExcelGroupingsClientResponse(filterClientResponseItems),
                        chartGroupingData: chartData,
                        stateCountData: groupedCountArray,
                        SiteCategoryCardData: categoryTabs,
                        selectedSiteCategoryId: defaultSiteCategoryId,
                        jsonFileContent: fileContent?.content
                    }));
                    calculateCardCounts(filterClientResponseData, fileContent?.content);
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                } finally {
                    setIsLoading(false);
                }
            })();
        } else if (didMount.current && !state.isDateFilterChange && state.isRefresh) {
            try {
                const filterClientResponseData = state.clientResponseItems.filter((i) => i.SiteCategoryId === state.selectedSiteCategoryId);
                const { filterClientResponseItems } = getFilteredData(state, filterClientResponseData);
                let fileContent: any = '';
                if (state.isCategoryChange) {
                    fileContent = state.JSONFiles?.find((i) => i?.siteCategoryId === state.selectedSiteCategoryId);
                }

                const groupedCountArray = groupResponseByQCState(filterClientResponseData, siteData.current);
                const chartData = {
                    State: buildStateWiseCRData(filterClientResponseItems),
                    SiteName: buildSiteWiseCRData(filterClientResponseItems),
                    Category: buildCategoryWiseCRData(filterClientResponseItems),
                    SubCategory: buildSubCategoryWiseCRData(filterClientResponseItems),
                    SubmissionDate: buildSubmissionDateWiseCRData(filterClientResponseItems),
                };

                setState((prevState: any) => {
                    const nextState: any = {
                        ...prevState,
                        filterClientResponseItems,
                        keyUpdate: Date.now(),
                        isRefresh: false,
                        isCategoryChange: false,
                        chartKeyUpdate: Date.now(),
                        gridGroupingData: buildExcelGroupingsClientResponse(filterClientResponseItems),
                        chartGroupingData: chartData,
                        stateCountData: groupedCountArray
                    };

                    if (state.isCategoryChange) {
                        nextState.jsonFileContent = fileContent?.content;
                        nextState.ReportedByOptions = buildUniqueOptions(filterClientResponseData, "ReportedBy");
                        nextState.SubCategoryOptions = buildUniqueOptions(filterClientResponseData, "SubCategory");
                    }

                    return nextState;
                });
                if (state.isCategoryChange) {
                    calculateCardCounts(filterClientResponseData, fileContent?.content);
                }

                // setIsLoading(false);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            }
        } else {
            didMount.current = true
        }
    }, [state.isRefresh]);

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const sitesMasterData = await _siteData2(provider);
                const [JSONFiles, clientResponseData] = await Promise.all([getJSONFileContent(provider), getClientResponseData(sitesMasterData)]);

                const { categoryTabs, defaultSiteCategoryId } = generateSiteCategoryItems(clientResponseData);
                const filterClientResponseItems = clientResponseData.filter((i) => i.SiteCategoryId === defaultSiteCategoryId);
                let fileContent = JSONFiles?.find((i) => i?.siteCategoryId === defaultSiteCategoryId);

                const groupedCountArray = groupResponseByQCState(filterClientResponseItems, sitesMasterData);
                const chartData = {
                    State: buildStateWiseCRData(filterClientResponseItems),
                    SiteName: buildSiteWiseCRData(filterClientResponseItems),
                    Category: buildCategoryWiseCRData(filterClientResponseItems),
                    SubCategory: buildSubCategoryWiseCRData(filterClientResponseItems),
                    SubmissionDate: buildSubmissionDateWiseCRData(filterClientResponseItems),
                };
                siteData.current = sitesMasterData;
                setState((prevState: any) => ({
                    ...prevState, isLoading: false,
                    jsonFileContent: fileContent?.content,
                    clientResponseItems: clientResponseData,
                    filterClientResponseItems: filterClientResponseItems,
                    gridGroupingData: buildExcelGroupingsClientResponse(filterClientResponseItems),
                    keyUpdate: Math.random(),
                    ReportedByOptions: buildUniqueOptions(filterClientResponseItems, "ReportedBy"),
                    SubCategoryOptions: buildUniqueOptions(filterClientResponseItems, "SubCategory"),
                    chartGroupingData: chartData,
                    stateCountData: groupedCountArray,
                    SiteCategoryCardData: categoryTabs,
                    selectedSiteCategoryId: defaultSiteCategoryId,
                    JSONFiles: JSONFiles,
                    isRefresh: false,
                    isCategoryChange: false

                }));
                calculateCardCounts(filterClientResponseItems, fileContent?.content);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);

            }
            _userActivityLog();
        })();
    }, []);

    const handleSearch = () => {
        if (state.isDateFilterChange) {
            setState((prevState: any) => ({
                ...prevState, isRefresh: true,
                selectedReportedBy: [],
                selectedSubCategory: []
            }));
        } else {
            setState((prevState: any) => ({ ...prevState, isRefresh: true }));
        }

    };

    const handleReset = () => {
        const resetFilters = {
            ...state,
            ReportedByOptions: [],
            selectedReportedBy: [],
            selectedSubCategory: [],
            SubCategoryOptions: [],
            selectedCategory: [],
            selectedStatesId: [],
            selectedSiteTitles: [],
            selectedItem: { key: 'Last 7 Days', text: 'Last 7 Days' },
            clientResponseItems: [],
            filterClientResponseItems: [],
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
            selectedResponseItem: undefined,
            isCategoryChange: true
        };

        setState(prev => ({ ...prev, ...resetFilters }));
    };

    // Send email 
    const generatePDF = () => {
        let fileName: string = generatePdfFileName(`ClientFeedbackReport`);
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

            let fileName: string = generatePdfFileName(`ClientFeedbackReport`);
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFForReports("reports-id", fileName, false, false);

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
                    ReportName: CRGridTitles.ClientFeedbackReport,
                    // StateName: state || "All State",
                    SiteName: "All Site",
                    EmailType: "ClientResponseReportPDF"
                };
                provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                    provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                        const logObj = {
                            UserName: currentUserRoleDetail?.title,
                            ActionType: UserActivityActionTypeEnum.SendEmail,
                            EntityType: UserActionEntityTypeEnum.ClientResponse,
                            EntityName: UserActionEntityTypeEnum.ClientResponseReportChart,
                            Details: `Sent Client Feedback Charts to ${emailState?.title}`,
                            LogFor: UserActionLogFor.Both,
                            Email: currentUserRoleDetail?.emailId,
                            Count: 1,
                        };
                        void UserActivityLog(provider, logObj, currentUserRoleDetail);
                    }).catch((err: any) => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onClickCancelEmailPopup();
                    setIsLoading(false);
                    // document.querySelectorAll(`#reports-id .noExport`).forEach((el: Element) => {
                    //     if (el instanceof HTMLElement) {
                    //         el.style.display = "block";
                    //     }
                    // });
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
        isLoading,
        toggleSidebar,
        menuItems,
        onClickLeftNavigation,
        onRenderComponent,
        provider,
        context,
        currentUserRoleDetail,
        onStateChange,
        handleSiteChange,
        handleDropdownChange,
        handleReset,
        handleSearch,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        setState,
        isEmailPopupVisible,
        onclickSendEmailPopup,
        onClickSendEmail,
        emailState,
        hideEmailPopup,
        onChangeTitle,
        onChangeSendToEmail,
        onClickCancelEmailPopup,
        exportMenuProps,
        categoryCountCard,
        handleCardClick,
        showDetails
    };
};
