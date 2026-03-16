import React from "react";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { ComponentNameEnum, defaultValues, ListNames, WHSCommitteeMeetingTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import CamlBuilder from "camljs";
import { _copyAndSort, _isExpired, _isOverdue, getCAMLQueryFilterExpression, getScoreStatsWithOwners, getUniueRecordsByColumnName, isUpcomingDate, isWithinNextMonthRangeOnlyOneMonth, mapSingleValue, processATRoles } from "../../../../../../Common/Util";
import { DataType } from "../../../../../../Common/Constants/CommonConstants";
import { ISiteDetailGridProps } from "./SiteDetailGrid";
import moment from "moment";
import { IAssetMaster, ICards, IConfigurationColumn, IQuaySafeTab, ISitesAssociatedChemical, ISitesMasterGridDetails } from "../SiteDetailViewInterface";
import { FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { IDropdownOption } from "@fluentui/react";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toastService } from "../../../../../../Common/ToastService";

export interface ISiteDetailGridDataState {
    isLoading: boolean;
    allItems: ISitesMasterGridDetails[];
    filterItems: ISitesMasterGridDetails[];
    selectedDateRangeItem: any;
    fromDate: Date | any;
    toDate: Date | any;
    filterFromDate: any
    isGettingSubList: boolean;
    siteCategoryOptions: IReactDropOptionProps[];
    selectedCategory: string[];
    filterToDate: any;
    selectedStatesId: any[];
    selectedStates: any[];
    selectedSiteIds: any[];
    stateKeyUpdate: number;
    stateRenderKeyUpdate: number;
    selectedSiteTitles: any[];
    selectedSCSites: any[];
    isApplyFilterDisable: boolean;
    cards: ICards;
    selectedCards: string;
    isConfigurePanelOpen: boolean;
    configurationColumn: IConfigurationColumn[];
    finalConfigurationColumn: IConfigurationColumn[];
    isConfigurationSaveDisable: boolean;
    siteAuditReportConfiguration: any;
    isConfigurationColumnReload: boolean;
    currentPage: number;
    itemsPerPage: number;
    pageItems: any[];
    startedIndex: any;
    endedIndex: any;
    isReloadItems: boolean;
    sortingColumn: { key: string, isSorted: any }
    keyUpdate: number;
    // cacheKey: string;
}


export const SiteDetailGridData = (props: ISiteDetailGridProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail, context, currentUser } = appGlobalState;
    const [state, setState] = React.useState<ISiteDetailGridDataState>({
        isLoading: false,
        isReloadItems: false,
        startedIndex: 0,
        sortingColumn: { key: "", isSorted: "" },
        endedIndex: 0,
        stateRenderKeyUpdate: Math.random(),
        pageItems: [],
        itemsPerPage: 50,
        keyUpdate: Math.random(),
        currentPage: 1,
        isConfigurationColumnReload: false,
        siteAuditReportConfiguration: "",
        isConfigurationSaveDisable: false,
        finalConfigurationColumn: [
            { label: "Select All", value: true },
            { label: "Job Code", value: true },
            { label: "Site Manager", value: true },
            { label: "Dynamic Site Manager", value: true },
            { label: "Site Supervisor", value: true },
            { label: "Client", value: true },
            { label: "Assets", value: true },
            { label: "Chemicals", value: true },
            { label: "Assigned Team", value: true },
            { label: "Toolbox Talks", value: true },
            { label: "Incident Reports", value: true },
            { label: "Skill Matrix", value: true },
            { label: "Corrective Action", value: true },
            { label: "Workplace Inspection", value: true },
            { label: "WHS Committee Inspection", value: true },
            { label: "WHS Committee Meeting", value: true },
            { label: "WHS Committee Agenda", value: true },
            { label: "Documents", value: true },
            { label: "Safety Culture", value: true },
            { label: "Periodic Tasks", value: true },
            { label: "Help Desk", value: true },
            { label: "Site KPI's", value: true },
            { label: "Events", value: true },
            { label: "Client Response", value: true },
        ],
        configurationColumn: [
            { label: "Select All", value: true },
            { label: "Job Code", value: true },
            { label: "Site Manager", value: true },
            { label: "Dynamic Site Manager", value: true },
            { label: "Site Supervisor", value: true },
            { label: "Client", value: true },
            { label: "Assets", value: true },
            { label: "Chemicals", value: true },
            { label: "Assigned Team", value: true },
            { label: "Toolbox Talks", value: true },
            { label: "Incident Reports", value: true },
            { label: "Skill Matrix", value: true },
            { label: "Corrective Action", value: true },
            { label: "Workplace Inspection", value: true },
            { label: "WHS Committee Inspection", value: true },
            { label: "WHS Committee Meeting", value: true },
            { label: "WHS Committee Agenda", value: true },
            { label: "Documents", value: true },
            { label: "Safety Culture", value: true },
            { label: "Periodic Tasks", value: true },
            { label: "Help Desk", value: true },
            { label: "Site KPI's", value: true },
            { label: "Events", value: true },
            { label: "Client Response", value: true },
        ],
        // cacheKey: `SiteGrid-${currentUser?.displayName}`,
        allItems: [],
        isGettingSubList: false,
        filterItems: [],
        fromDate: "",
        filterFromDate: moment(new Date()).subtract(29, 'days').format(defaultValues.FilterDateFormate),
        filterToDate: moment(new Date()).format(defaultValues.FilterDateFormate),
        toDate: "",
        selectedDateRangeItem: { value: 'Last 30 Days', key: 'Last 30 Days', text: 'Last 30 Days', label: 'Last 30 Days' },
        siteCategoryOptions: [],
        selectedCategory: [],
        selectedSiteIds: [],
        selectedStates: [],
        selectedStatesId: [],
        stateKeyUpdate: Math.random(),
        selectedSiteTitles: [],
        selectedSCSites: [],
        isApplyFilterDisable: true,
        isConfigurePanelOpen: false,
        cards: {
            totalCount: 0,
            blankSiteManagerCount: 0,
            blankSiteSuperVisorCount: 0,
            blankClient: 0,
            blankAssetCount: 0,
            blankChemicalCount: 0
        },
        selectedCards: ""
    })

    const fetchFromMultipleLists = async (
        configs: {
            listName: string; viewFields: string[]; filterField?: any[]; key: string,
            LookupColumnName?: { lookUpName: string, expandColumnNameOne: string, expandAliasOne: string, expandColumnNameTwo: string, expandAliasTwo: string },
            LookupColumnNameSingle?: { lookUpName: string, expandColumnNameOne: string, expandAliasOne: string },
        }[],
        commonFields: string[],

    ) => {
        const promises = configs.map(cfg => {
            const finalFields = [...commonFields, ...(cfg.viewFields || [])]
                .filter((field, index, arr) => arr.indexOf(field) === index);
            if (!!cfg.LookupColumnName) {
                const camelQuery = new CamlBuilder()
                    .View(finalFields)
                    .LeftJoin(cfg.LookupColumnName.lookUpName, cfg.LookupColumnName.lookUpName).Select(cfg.LookupColumnName.expandColumnNameOne, cfg.LookupColumnName.expandAliasOne).Select(cfg.LookupColumnName.expandColumnNameTwo, cfg.LookupColumnName.expandAliasTwo)

                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query()


                if (cfg.filterField && cfg.filterField.length > 0) {
                    const siteFilter: any[] = getCAMLQueryFilterExpression(cfg.filterField);
                    camelQuery.Where().All(siteFilter);
                }

                const finalQuery = camelQuery.ToString();

                return provider.getItemsByCAMLQuery(cfg.listName, finalQuery)
                    .then(items => ({
                        listName: cfg.listName,
                        items,
                        key: cfg.key,
                        isError: false
                    }))
                    .catch(error => ({
                        listName: cfg.listName,
                        items: [],
                        isError: true,
                        errorMessage: error,
                        key: cfg.key
                    }));
            } else if (!!cfg.LookupColumnNameSingle) {
                const camelQuery = new CamlBuilder()
                    .View(finalFields)
                    .LeftJoin("SkillMatrix", "SkillMatrix").Select("CalcFormStatus", "CalcFormStatus")
                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query();

                if (cfg.filterField && cfg.filterField.length > 0) {
                    const siteFilter: any[] = getCAMLQueryFilterExpression(cfg.filterField);
                    camelQuery.Where().All(siteFilter);
                }

                const finalQuery = camelQuery.ToString();

                return provider.getItemsByCAMLQuery(cfg.listName, finalQuery)
                    .then(items => ({
                        listName: cfg.listName,
                        items,
                        key: cfg.key,
                        isError: false
                    }))
                    .catch(error => ({
                        listName: cfg.listName,
                        items: [],
                        isError: true,
                        errorMessage: error,
                        key: cfg.key
                    }));
            }
            else {
                const camelQuery = new CamlBuilder()
                    .View(finalFields)
                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query();

                if (cfg.filterField && cfg.filterField.length > 0) {
                    const siteFilter: any[] = getCAMLQueryFilterExpression(cfg.filterField);
                    camelQuery.Where().All(siteFilter);
                }

                const finalQuery = camelQuery.ToString();

                return provider.getItemsByCAMLQuery(cfg.listName, finalQuery)
                    .then(items => ({
                        listName: cfg.listName,
                        items,
                        key: cfg.key,
                        isError: false
                    }))
                    .catch(error => ({
                        listName: cfg.listName,
                        items: [],
                        isError: true,
                        errorMessage: error,
                        key: cfg.key
                    }));
            }

        });

        // ✅ Wait for all, keeping original order
        return Promise.all(promises);
    };
    const getSiteRelatedItems = (list: any[], siteId: number) =>
        list?.filter((r) => !!r.SiteName && r.SiteName.filter((s: any) => s.lookupId === siteId)?.length > 0) || [];


    const onChangeRangeOption = (item: IDropdownOption): void => {
        if (item?.key == "Custom Range") {
            setState((prevState: any) => ({
                ...prevState, selectedDateRangeItem: item, filterFromDate: "", filterToDate: "",
                selectedStates: [],
                selectedSiteIds: [],
                selectedStatesId: [],
                stateKeyUpdate: Math.random(),
                stateRenderKeyUpdate: Math.random(),
                selectedSiteTitles: [],
                selectedSCSites: [],
                selectedCategory: [],
                selectedCards: "",
            }));
        }
        else if (!!item && item.key == "All") {
            setState((prevState: any) => ({
                ...prevState,
                selectedDateRangeItem: "",
                filterFromDate: "",
                filterToDate: "",
                stateRenderKeyUpdate: Math.random(),
                fromDate: "",
                toDate: "",
                stateKeyUpdate: Math.random(),
                selectedStates: [],
                selectedSiteIds: [],
                selectedStatesId: [],
                selectedSiteTitles: [],
                selectedSCSites: [],
                selectedCategory: [],
                selectedCards: "",

            }));
        }
        else if (!!item) {
            setState((prevState: any) => ({
                ...prevState, selectedDateRangeItem: item, isApplyFilterDisable: false,

                selectedStates: [],
                selectedSiteIds: [],
                stateKeyUpdate: Math.random(),
                stateRenderKeyUpdate: Math.random(),
                selectedStatesId: [],
                selectedSiteTitles: [],
                selectedSCSites: [],
                selectedCategory: [],
                selectedCards: "",
            }));
        } else {
            setState((prevState: any) => ({
                ...prevState,
                selectedDateRangeItem: "",
                filterFromDate: "",
                filterToDate: "",
                stateRenderKeyUpdate: Math.random(),
                fromDate: "",
                toDate: "",
                stateKeyUpdate: Math.random(),
                selectedStates: [],
                selectedSiteIds: [],
                selectedStatesId: [],
                selectedSiteTitles: [],
                selectedSCSites: [],
                selectedCategory: [],
                selectedCards: "",

            }));
        }

    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState((prevState: any) => ({ ...prevState, filterToDate: filterDate, toDate: date, isApplyFilterDisable: false }))

    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState((prevState: any) => ({ ...prevState, filterFromDate: filterDate, fromDate: date, isApplyFilterDisable: false }))
    };

    const onChangeCategory = (option: IReactDropOptionProps[]) => {
        let opt: any[] = []
        if (option.length > 0) {
            opt = option.map((i) => i.value);
        }
        setState((prevState: any) => ({ ...prevState, selectedCategory: opt, isApplyFilterDisable: false }))

    }

    const onStateChange = (stateIds: number[], options?: any) => {

        setState((prevState: any) => ({
            ...prevState,
            selectedStates: (!!options && options.length > 0) ? options.map((r: any) => r.text) : [],
            selectedSiteIds: [],
            selectedStatesId: (!!stateIds && stateIds.length > 0) ? stateIds : [],
            selectedSiteTitles: [],
            selectedSCSites: [],
            stateKeyUpdate: Math.random(),
            isApplyFilterDisable: false,
        }))
    }

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {

        setState((prevState) => ({
            ...prevState,
            isApplyFilterDisable: false,
            selectedSiteIds: siteIds,
            selectedSiteTitles: siteTitles,
            selectedSCSites: siteSC
        }));
    };

    const onClickApplyFilter = () => {
        setState((prevState: any) => ({ ...prevState, isApplyFilterDisable: true, selectedCards: "" }))
    }

    const getCardCount = (items: ISitesMasterGridDetails[]): ICards => {
        let obj = {
            totalCount: items?.length || 0,
            blankSiteManagerCount: 0,
            blankSiteSuperVisorCount: 0,
            blankClient: 0,
            blankAssetCount: 0,
            blankChemicalCount: 0,
        }

        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            if (element?.AssetMaster?.totalAssetsCount == 0) {
                obj.blankAssetCount++;
            }
            if (element?.SitesAssociatedChemical?.totalChemicalCount == 0) {
                obj.blankChemicalCount++;
            }
            if (element?.siteManagerId?.length == 0) {
                obj.blankSiteManagerCount++;
            }
            if (element?.siteSupervisorId?.length == 0) {
                obj.blankSiteSuperVisorCount++;
            }
            if (element?.adClientId?.length == 0) {
                obj.blankClient++;
            }

        }

        return obj;

    }

    const onClickCard = (cardName: any) => {
        setState((prevState) => ({ ...prevState, selectedCards: (cardName == "Total Sites" ? "" : (prevState.selectedCards == cardName ? "" : cardName)) }))
    }

    const onClickConfigureColumn = () => {
        setState((prevState: any) => ({ ...prevState, isConfigurePanelOpen: true }));
    }

    const onClickDismissPanel = () => {
        setState((prevState: any) => ({ ...prevState, isConfigurePanelOpen: false, finalConfigurationColumn: state.configurationColumn }));
    }



    // const _onChangeConfigurationColumn = (label: string, index: number, isChecked?: boolean) => {
    //     let configurationColumn = state.finalConfigurationColumn;
    //     configurationColumn[index] = { ...configurationColumn[index], value: isChecked || false }
    //     if (label == "Select All") {
    //         configurationColumn = configurationColumn.map((i) => {
    //             return { ...i, value: isChecked || false, disable: false }

    //         })
    //     }
    //     const filterColumn = configurationColumn.filter((i: any) => i.label != "Select All" && i.value == true)?.length;
    //     const isAllSelect = (state.finalConfigurationColumn.length - 1) == filterColumn
    //     if (label != "Select All") {
    //         configurationColumn[0] = { ...configurationColumn[0], value: isAllSelect }
    //     }
    //     setState((prevState) => ({ ...prevState, finalConfigurationColumn: configurationColumn, isConfigurationSaveDisable: false }));
    // }
    const _onChangeConfigurationColumn = (
        label: string,
        index: number,
        isChecked?: boolean
    ) => {
        setState((prevState) => {
            // ✅ Create a shallow clone of each item to avoid mutating state
            let configurationColumn = prevState.finalConfigurationColumn.map((col) => ({ ...col }));

            // Update the clicked column
            configurationColumn[index] = {
                ...configurationColumn[index],
                value: isChecked || false,
            };

            // Handle "Select All"
            if (label === "Select All") {
                configurationColumn = configurationColumn.map((col) => ({
                    ...col,
                    value: isChecked || false,
                    disable: false,
                }));
            }

            // Calculate selected count (excluding "Select All")
            const selectedCount = configurationColumn.filter(
                (col) => col.label !== "Select All" && col.value === true
            ).length;

            // Check if all are selected
            const isAllSelect = configurationColumn.length - 1 === selectedCount;

            // Update "Select All" checkbox state if necessary
            if (label !== "Select All") {
                configurationColumn[0] = {
                    ...configurationColumn[0],
                    value: isAllSelect,
                };
            }


            return {
                ...prevState,
                finalConfigurationColumn: configurationColumn,
                isConfigurationSaveDisable: false,
            };
        });
    };


    const onClickConfigureColumnSave = async () => {

        try {

            let isEditMode: boolean = Number(state.siteAuditReportConfiguration?.ID) > 0
            const toastId = toastService.loading(isEditMode ? 'Updating Column...' : 'Saving Column...');
            const toastMessage = isEditMode ? 'Configuration has been updated successfully!' : 'Configuration has been added successfully!';
            setState((prevState) => ({ ...prevState, isLoading: true }));
            let obj = {
                Title: currentUser.displayName,
                UserId: currentUser.userId,
                ConfiguredColumn: JSON.stringify(state.finalConfigurationColumn)
            }
            if (!!state.siteAuditReportConfiguration && !!state.siteAuditReportConfiguration?.ID && Number(state.siteAuditReportConfiguration?.ID) > 0) {
                await provider.updateItem({ ConfiguredColumn: JSON.stringify(state.finalConfigurationColumn) }, ListNames.SiteAuditReportConfiguration, Number(state.siteAuditReportConfiguration?.ID))
            } else {
                await provider.createItem(obj, ListNames.SiteAuditReportConfiguration)
            }

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            setState((prevState) => ({
                ...prevState,
                isConfigurePanelOpen: false, isLoading: false,
                configurationColumn: state.finalConfigurationColumn,
                isConfigurationSaveDisable: true,
                isConfigurationColumnReload: !prevState.isConfigurationColumnReload,

            }));
        } catch (error) {
            console.log(error);

            setState((prevState) => ({ ...prevState, isConfigurePanelOpen: false, isLoading: false }));
        }


    }

    const columnVisibility = state.configurationColumn.reduce((acc, col) => {
        acc[col.label] = col.value;
        return acc;
    }, {} as Record<string, boolean>);


    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Sites Audit Report");

        // ---------------------------------------------
        // STEP 1: Dynamic headers
        // ---------------------------------------------
        const headers = ["Site Name", "State"];
        const dynamicColumns = state.configurationColumn.filter((col) => col.label != "Select All" && col.value).map((col) => col.label);
        const allHeaders = [...headers, ...dynamicColumns];

        // Add header row
        const headerRow = sheet.addRow(allHeaders);

        // Style header row (#64748B)
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF64748B" }, // Header background color
            };
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin", color: { argb: "FFFFFFFF" } },
                bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
            };
        });

        // ---------------------------------------------
        // STEP 2: Helper for cell colors
        // ---------------------------------------------
        const getCellColor = (value: number) => {
            value = Number(value) || 0;
            if (value >= 5) return "FF22C55E"; // green
            if (value >= 1 && value < 5) return "FFFACC15"; // yellow
            if (value === 0) return "FFEF4444"; // red
            return "FFFFFFFF"; // default white
        };

        // ---------------------------------------------
        // STEP 3: Add data rows
        // ---------------------------------------------
        const allRowsData: any[] = [];

        state.filterItems.forEach((i: any) => {
            const rowValues = [
                i.name,
                i.state,
                ...(columnVisibility["Job Code"] ? [i?.jobCode || 0] : []),
                ...(columnVisibility["Site Manager"] ? [i?.siteManagerId?.length || 0] : []),
                ...(columnVisibility["Dynamic Site Manager"] ? [!!i?.dynamicSiteManagerId ? 1 : 0 || 0] : []),
                ...(columnVisibility["Site Supervisor"] ? [i?.siteSupervisorId?.length || 0] : []),
                ...(columnVisibility["Client"] ? [i?.adClientId?.length || 0] : []),
                ...(columnVisibility["Assets"] ? [i?.AssetMaster?.totalAssetsCount || 0] : []),
                ...(columnVisibility["Chemicals"] ? [i?.SitesAssociatedChemical?.totalChemicalCount || 0] : []),
                ...(columnVisibility["Assigned Team"] ? [i?.SitesAssociatedTeam?.totalCount || 0] : []),
                ...(columnVisibility["Toolbox Talks"] ? [i?.ToolboxTalk?.totalCount || 0] : []),
                ...(columnVisibility["Incident Reports"] ? [i?.ToolboxIncident?.totalCount || 0] : []),
                ...(columnVisibility["Skill Matrix"] ? [i?.SkillMatrix?.totalCount || 0] : []),
                ...(columnVisibility["Corrective Action"] ? [i?.CorrectiveActionReport?.totalCount || 0] : []),
                ...(columnVisibility["Workplace Inspection"] ? [i?.WorkplaceInspectionChecklist?.totalCount || 0] : []),
                ...(columnVisibility["WHS Committee Inspection"] ? [i?.SiteSafetyAudit?.totalCount || 0] : []),
                ...(columnVisibility["WHS Committee Meeting"] ? [i?.WHSCommitteeMeeting?.totalCount || 0] : []),
                ...(columnVisibility["WHS Committee Agenda"] ? [i?.WHSCommitteeMeetingAgenda?.totalCount || 0] : []),
                ...(columnVisibility["Documents"]
                    ? [
                        (i?.SiteDocuments?.totalCount || 0) +
                        (i?.URLLink?.totalCount || 0) +
                        (i?.DocumentsLink?.totalCount || 0),
                    ]
                    : []),
                ...(columnVisibility["Safety Culture"] ? [i?.AuditInspectionData?.totalCount || 0] : []),
                // ...(columnVisibility["Periodic Tasks"] ? [i?.Periodic?.totalCount || 0] : []),
                // ...(columnVisibility["Help Desk"] ? [i?.HelpDesk?.totalCount || 0] : []),
                // ...(columnVisibility["Job Control Checklist"] ? [i?.JobControlChecklistDetails?.totalCount || 0]: []),
                ...(columnVisibility["Periodic Tasks"]
                    ? [i?.periodic === false ? "N/A" : (i?.Periodic?.totalCount || 0)]
                    : []),

                ...(columnVisibility["Help Desk"]
                    ? [i?.helpDeskNeeded === false ? "N/A" : (i?.HelpDesk?.totalCount || 0)]
                    : []),

                ...(columnVisibility["Site KPI's"]
                    ? [i?.jobControlChecklist === false ? "N/A" : (i?.JobControlChecklistDetails?.totalCount || 0)]
                    : []),
                // ...(columnVisibility["Events"] ? [i?.EventMaster?.totalCount || 0] : []),
                ...(columnVisibility["Events"]
                    ? [i?.manageEvents === false ? "N/A" : (i?.EventMaster?.totalCount || 0)]
                    : []),
                // ...(columnVisibility["Client Response"] ? [i?.ClientResponse?.totalCount || 0] : []),
                ...(columnVisibility["Client Response"] ? [i?.clientResponse === false ? "N/A" : (i?.ClientResponse?.totalCount || 0)] : []),
            ];

            allRowsData.push(rowValues);
            const row = sheet.addRow(rowValues);

            // Apply background color for numeric cells
            row.eachCell((cell, colNumber) => {
                if (colNumber > 3 && typeof cell.value === "number") {
                    const bgColor = getCellColor(cell.value as number);
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                }
                cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
                cell.border = {
                    top: { style: "thin", color: { argb: "FFDDDDDD" } },
                    bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
                    left: { style: "thin", color: { argb: "FFDDDDDD" } },
                    right: { style: "thin", color: { argb: "FFDDDDDD" } },
                };
            });
        });

        // ---------------------------------------------
        // STEP 4: Auto-adjust column widths
        // ---------------------------------------------
        sheet.columns.forEach((column, colIndex) => {
            let maxLength = allHeaders[colIndex]?.length || 10;
            allRowsData.forEach((row) => {
                const cellValue = row[colIndex] ? row[colIndex].toString() : "";
                maxLength = Math.max(maxLength, cellValue.length);
            });

            if (colIndex === 0) column.width = 35; // ~250px
            else if (colIndex === 2) column.width = 20; // ~150px
            else column.width = Math.min(maxLength + 5, 30); // limit others
        });

        // ---------------------------------------------
        // STEP 5: Freeze header row & first column
        // ---------------------------------------------
        sheet.views = [
            {
                state: "frozen",
                xSplit: 1, // freeze first column
                ySplit: 1, // freeze header row
            },
        ];

        // ---------------------------------------------
        // STEP 6: Save Excel file
        // ---------------------------------------------
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer]), "Sites Audit Report.xlsx");
        });
    };

    const onClickRow = (siteNameId: ISitesMasterGridDetails) => {

        props.manageComponentView({
            siteMasterId: siteNameId.ID,
            currentComponentName: ComponentNameEnum.SiteDetailView,
            preViousComponentName: ComponentNameEnum.SiteDetailGrid
        })
    }


    const onClickHeader = (columnName: string) => {
        let defaultSorting = state.sortingColumn;
        let isSorted = defaultSorting.key != "" ? (defaultSorting.key == columnName ? !defaultSorting.isSorted : false) : false;
        let sortedData = _copyAndSort(state.filterItems, columnName, isSorted)
        let sortingColumn = { isSorted: isSorted, key: columnName };
        setState((prevState: any) => ({ ...prevState, filterItems: sortedData, sortingColumn: sortingColumn, isReloadItems: !prevState.isReloadItems }));

    }


    const handlePagination = (newPage: any) => {
        const totalPages = Math.ceil(state.filterItems?.length / state.itemsPerPage);
        if (newPage < 1) {
            newPage = 1;
        } else if (newPage > totalPages) {
            newPage = totalPages;
        }
        // setCurrentPage(newPage);
        const startIndex = (newPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage > state.filterItems?.length ? state.filterItems?.length : startIndex + state.itemsPerPage;
        // startedIndex.current = startIndex;
        // endedIndex.current = endIndex;
        let pageItems = state.filterItems.slice(startIndex, endIndex)

        setState((prevState) => ({
            ...prevState,
            pageItems: pageItems, keyUpdate: Math.random(),
            currentPage: newPage,
            startedIndex: startIndex,
            endedIndex: endIndex
        }))
        // setDisplayedItems(AllData?.current?.slice(startIndex, endIndex));
    };

    React.useEffect(() => {
        handlePagination(1)
    }, [state.isReloadItems])

    // React.useEffect(() => {

    //     let pageItems = state.filterItems.slice(state.startedIndex, state.endedIndex)
    //     setState((prevState) => ({ ...prevState, pageItems: pageItems, keyUpdate: Math.random(), }))

    // }, [state.startedIndex, state.endedIndex, state.currentPage])


    React.useEffect(() => {
        if (state.isApplyFilterDisable == true || !!state.selectedCards) {

            let filterItems: ISitesMasterGridDetails[] = state.allItems;
            if (state?.selectedStates?.length > 0) {
                filterItems = filterItems.filter((i) => state.selectedStates.indexOf(i.state) > -1);
            }
            if (state?.selectedSiteIds?.length > 0) {
                filterItems = filterItems.filter((i) => state.selectedSiteIds.indexOf(i.ID) > -1);
            }

            if (state?.selectedCategory?.length > 0) {
                filterItems = filterItems.filter((i) => state.selectedCategory.indexOf(i.category) > -1);
            }
            let cards = getCardCount(filterItems);



            if (state?.selectedCards) {
                filterItems = filterItems.filter((i) => {
                    switch (state.selectedCards) {
                        case "Site Manager":
                            return !i?.siteManagerId?.length;

                        case "Site Supervisor":
                            return !i?.siteSupervisorId?.length;

                        case "Client":
                            return !i?.adClientId?.length;

                        case "Asset":
                            return i?.AssetMaster?.totalAssetsCount === 0;

                        case "Chemical":
                            return i?.SitesAssociatedChemical?.totalChemicalCount === 0;

                        default:
                            return true;
                    }
                });
            }
            setState((prevState: any) => ({ ...prevState, filterItems: filterItems, cards: cards, isReloadItems: !prevState.isReloadItems }));
        }



    }, [state.isApplyFilterDisable, state.selectedCards])

    React.useEffect(() => {
        (async () => {
            try {
                const camelQuery = new CamlBuilder()
                    .View(['ID', 'Title', 'User', 'ConfiguredColumn'])
                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query()
                    .Where()
                    .LookupField('User').Id().EqualTo(currentUser.userId)
                    .ToString()

                let data = await provider.getItemsByCAMLQuery(ListNames.SiteAuditReportConfiguration, camelQuery);
                let configurationColumn: any[] = state.configurationColumn
                let isConfigurationAvailable: boolean = false
                let siteAuditReportConfiguration: any = "";
                if (!!data && data.length > 0) {
                    let items = data[0];
                    siteAuditReportConfiguration = items;
                    if (!!items?.ConfiguredColumn) {
                        configurationColumn = JSON.parse(items?.ConfiguredColumn)
                        isConfigurationAvailable = true;
                    }
                }
                setState((prevState) => ({
                    ...prevState,
                    configurationColumn: configurationColumn,
                    finalConfigurationColumn: configurationColumn,
                    isConfigurationSaveDisable: isConfigurationAvailable, siteAuditReportConfiguration: siteAuditReportConfiguration
                }))

            } catch (error) {
                console.log(error);

            }
        })();

    }, [state.isConfigurationColumnReload]);



    React.useEffect(() => {
        const commonFields = ["ID", "Title", "SiteName"];
        let commonFilter: any[] = []
        if (state.filterFromDate && state.filterToDate) {
            commonFilter = [
                { fieldName: `Created`, fieldValue: `${state.filterFromDate}`, fieldType: FieldType.DateTime, LogicalType: LogicalType.GreaterThanOrEqualTo },
                { fieldName: `Created`, fieldValue: `${state.filterToDate}`, fieldType: FieldType.DateTime, LogicalType: LogicalType.LessThanOrEqualTo }

            ]
        }

        let siteMasterFilter = []
        if (currentUserRoleDetail.isAdmin == false && currentUserRoleDetail.isStateManager && !!currentUserRoleDetail.currentUserAllCombineStateId && currentUserRoleDetail?.currentUserAllCombineStateId.length > 0) {
            siteMasterFilter.push({
                fieldName: `QCState`,
                fieldValue: currentUserRoleDetail.currentUserAllCombineStateId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.In
            });
        } else if (currentUserRoleDetail.isShowOnlyChairPerson && currentUserRoleDetail.whsChairpersonsStateId.length > 0) {
            siteMasterFilter.push({
                fieldName: `QCState`,
                fieldValue: currentUserRoleDetail.whsChairpersonsStateId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.In
            });
        }
        const MainListName = [
            {
                key: "SitesMasterDetails", listName: ListNames.SitesMaster, viewFields: ['QCState', 'DynamicSiteManager', 'JobCode', 'Category', 'SiteManager', 'SiteSupervisor', 'ADUser', 'Periodic', 'HelpDesk', 'ClientResponse', 'JobControlChecklist', 'ManageEvents', 'SSWasteReport', 'AmenitiesFeedbackForm', 'IsDailyCleaningDuties'],
                filterField: siteMasterFilter
            },
            {
                key: "AssetMaster", listName: ListNames.AssetMaster, viewFields: ["PurchasePrice", "ServiceDueDate", "AMStatus"], filterField: [

                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "SitesAssociatedChemical", listName: ListNames.SitesAssociatedChemical, viewFields: ["Hazardous", "MasterExpirationDate"], filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
                    { fieldName: `Chemicals`, fieldValue: "", fieldType: FieldType.LookupById, LogicalType: LogicalType.IsNotNull }
                ],
                LookupColumnName: { lookUpName: "Chemicals", expandColumnNameOne: "CalcHazardous", expandAliasOne: "Hazardous", expandColumnNameTwo: "ExpirationDate", expandAliasTwo: "MasterExpirationDate" },

            },

        ];

        const childList = [
            {
                key: "ToolboxTalk", listName: ListNames.ToolboxTalk, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    ...commonFilter,

                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]

            },
            {
                key: "ToolboxIncident", listName: ListNames.ToolboxIncident, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    ...commonFilter,

                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }

                ]
            },
            {
                key: "SkillMatrix", listName: ListNames.SkillMatrixInfo,
                viewFields: ['CalcFormStatus', 'SiteName'],

                filterField: [
                    ...commonFilter,
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ],
                LookupColumnNameSingle: { lookUpName: "SkillMatrix", expandColumnNameOne: "CalcFormStatus", expandAliasOne: "CalcFormStatus" },
            },

            {
                key: "CorrectiveActionReport", listName: ListNames.CorrectiveActionReport, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    ...commonFilter,

                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]
            },

            {
                key: "WorkplaceInspectionChecklist", listName: ListNames.WorkplaceInspectionChecklist, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    ...commonFilter,

                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]
            },

            {
                key: "SiteSafetyAudit", listName: ListNames.SiteSafetyAudit, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    ...commonFilter,

                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }

                ]
            },

            {
                key: "WHSCommitteeMeeting", listName: ListNames.WHSCommitteeMeetingMaster, viewFields: [],
                filterField: [
                    ...commonFilter,
                    { fieldName: `WHSCommitteeMeetingType`, fieldValue: WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingAgenda, fieldType: FieldType.Choice, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "WHSCommitteeMeetingAgenda", listName: ListNames.WHSCommitteeMeetingMaster, viewFields: [],
                filterField: [
                    ...commonFilter,
                    { fieldName: `WHSCommitteeMeetingType`, fieldValue: WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingAgenda, fieldType: FieldType.Choice, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "Periodic", listName: ListNames.Periodic, viewFields: [],
                filterField: [
                    ...commonFilter]
            },
            {
                key: "JobControlChecklistDetails", listName: ListNames.JobControlChecklistDetails, viewFields: ['Status', 'Created'],
                filterField: [
                    ...commonFilter
                ]
            },
            {
                key: "EventMaster", listName: ListNames.EventMaster, viewFields: ['EventDateTime'],
                filterField: [
                    ...commonFilter,
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `LinkFor`, fieldValue: "Client Dashboard", fieldType: FieldType.Choice, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "SitesAssociatedTeam", listName: ListNames.SitesAssociatedTeam, viewFields: ['ATRole'],
                filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "URLLink", listName: ListNames.URLLink, viewFields: [],
                filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "DocumentsLink", listName: ListNames.DocumentsLink, viewFields: [],
                filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "SiteDocuments", listName: ListNames.SiteDocuments, viewFields: ['FSObjType'],
                filterField: [
                    { fieldName: `FSObjType`, fieldValue: "0", fieldType: FieldType.Text, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "HelpDesk", listName: ListNames.HelpDesk, viewFields: ['QCPriority', 'HDStatus'],
                filterField: [
                    ...commonFilter,
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "ClientResponse", listName: ListNames.ClientResponse, viewFields: [],
                filterField: [
                    ...commonFilter,
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
                ]
            },
            {
                key: "AuditInspectionData", listName: ListNames.AuditInspectionData, viewFields: ['Score', 'Owner'],
                filterField: [
                    ...commonFilter,
                    { fieldName: "Archived", fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]
            },


        ];


        (async () => {
            try {
                // if (state.filterFromDate && state.filterToDate) {
                /**
                 * Get the first main list
                 */

                setState((prevState: any) => ({ ...prevState, isLoading: true, isGettingSubList: true }));
                let allData = await fetchFromMultipleLists(MainListName, commonFields);
                const SiteItems: ISitesMasterGridDetails[] = [];
                let categoryOptions: IReactDropOptionProps[] = [];
                if (Array.isArray(allData) && allData.length > 0) {


                    // --- Helpers ---


                    const buildDefaultSiteMaster = (): ISitesMasterGridDetails => ({
                        name: "",
                        ID: 0,
                        state: "",
                        jobCode: "",
                        category: "",
                        lastReportGeneratedDate: "",
                        whoGenerated: "",
                        siteManager: [],
                        siteSupervisor: [],
                        adClient: [],
                        siteManagerId: [],
                        siteSupervisorId: [],
                        adClientId: [],
                        totalMember: 0,
                        periodic: false,
                        helpDeskNeeded: false,
                        clientResponse: false,
                        jobControlChecklist: false,
                        manageEvents: false,
                        ssWasteReport: false,
                        amenitiesFeedbackForm: false,
                        isDailyCleaningDuties: false,
                        AssetMaster: {
                            totalAssetsCount: 0,
                            repairsRequiredCount: 0,
                            overdueServicesCount: 0,
                            serviceDueCountOneMonth: 0,
                            assetValue: 0
                        },
                        SitesAssociatedChemical: {
                            totalChemicalCount: 0,
                            expiringSoonCount: 0,
                            expiredCount: 0,
                            hazardousCount: 0,
                            nonHazardousCount: 0
                        },
                        ToolboxTalk: {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        },
                        ToolboxIncident: {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        },
                        SkillMatrix: {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        },
                        CorrectiveActionReport: {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        },
                        WorkplaceInspectionChecklist: {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        },
                        SiteSafetyAudit: {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        },
                        WHSCommitteeMeetingAgenda: {
                            totalCount: 0
                        },
                        WHSCommitteeMeeting: {
                            totalCount: 0
                        },
                        Periodic: {
                            totalCount: 0
                        },
                        JobControlChecklistDetails: {
                            totalCount: 0,
                            notYetCheckedCount: 0
                        },
                        EventMaster: {
                            totalCount: 0,
                            eventDateTimeCount: 0
                        },
                        SitesAssociatedTeam: {
                            totalCount: 0,
                            atRoleGroup: [],
                        },
                        URLLink: {
                            totalCount: 0
                        },
                        DocumentsLink: {
                            totalCount: 0
                        },
                        SiteDocuments: {
                            totalCount: 0
                        },
                        HelpDesk: {
                            totalCount: 0,
                            lowCount: 0,
                            highCount: 0,
                            pendingCount: 0,
                            mediumCount: 0
                        },
                        ClientResponse: {
                            totalCount: 0
                        },
                        AuditInspectionData: {
                            totalCount: 0,
                            averageScore: undefined,
                            lowScore: undefined,
                            highScore: undefined,
                            OwnerCount: undefined
                        },
                        dynamicSiteManagerId: 0,
                        dynamicSiteManager: {
                            Id: 0,
                            emailId: "",
                            title: ""
                        }
                    });

                    // --- Main Loop ---
                    for (const element of allData) {
                        const { key, items: rawItems = [] } = element;

                        switch (key) {

                            case "SitesMasterDetails": {
                                const siteMasterItems = Array.isArray(rawItems) ? rawItems : [];
                                siteMasterItems.forEach((el) => {
                                    const siteManager = mapSingleValue(el.SiteManager, DataType.peoplePickerMultiple);
                                    const siteSupervisor = mapSingleValue(el.SiteSupervisor, DataType.peoplePickerMultiple);
                                    const adClient = mapSingleValue(el.ADUser, DataType.peoplePickerMultiple);
                                    if (!!el.Category) {
                                        categoryOptions.push({ label: el.Category, value: el.Category })
                                    }
                                    const totalMember = (siteManager.length || 0)
                                        + (siteSupervisor.length || 0)
                                        + (adClient.length || 0);

                                    const obj: ISitesMasterGridDetails = {
                                        ...buildDefaultSiteMaster(),
                                        jobCode: mapSingleValue(el.JobCode, DataType.string),
                                        ID: mapSingleValue(el.ID, DataType.number),
                                        name: mapSingleValue(el.Title, DataType.string),
                                        state: mapSingleValue(el.QCState, DataType.lookupValue),
                                        category: mapSingleValue(el.Category, DataType.string),
                                        siteManager,
                                        siteSupervisor,
                                        adClient,
                                        siteManagerId: mapSingleValue(el.SiteManager, DataType.peopleIdMuilt),
                                        siteSupervisorId: mapSingleValue(el.SiteSupervisor, DataType.peopleIdMuilt),
                                        adClientId: mapSingleValue(el.ADUser, DataType.peopleIdMuilt),
                                        totalMember,
                                        periodic: mapSingleValue(el.Periodic, DataType.YesNoTrueOnly),
                                        helpDeskNeeded: mapSingleValue(el.HelpDesk, DataType.YesNoTrueOnly),
                                        clientResponse: mapSingleValue(el.ClientResponse, DataType.YesNoTrueOnly),
                                        jobControlChecklist: mapSingleValue(el.JobControlChecklist, DataType.YesNoTrueOnly),
                                        manageEvents: mapSingleValue(el.ManageEvents, DataType.YesNoTrueOnly),
                                        ssWasteReport: mapSingleValue(el.SSWasteReport, DataType.YesNoTrueOnly),
                                        amenitiesFeedbackForm: mapSingleValue(el.AmenitiesFeedbackForm, DataType.YesNoTrueOnly),
                                        isDailyCleaningDuties: mapSingleValue(el.IsDailyCleaningDuties, DataType.YesNoTrueOnly),
                                        dynamicSiteManagerId: mapSingleValue(el.DynamicSiteManager, DataType.peopleId),
                                        dynamicSiteManager: mapSingleValue(el.DynamicSiteManager, DataType.peoplePicker),
                                    };

                                    SiteItems.push(obj);
                                });
                                break;
                            }

                            case "AssetMaster": {
                                SiteItems.forEach((site) => {
                                    const related = getSiteRelatedItems(rawItems, site.ID);

                                    const stats: any = related.reduce(
                                        (acc, curr) => {
                                            const isDue = isWithinNextMonthRangeOnlyOneMonth(curr["ServiceDueDate."]);
                                            const isOverdue = _isOverdue(curr["ServiceDueDate."]);

                                            acc.totalAssetsCount++;
                                            if (isDue) acc.serviceDueCountOneMonth++;
                                            if (isOverdue) acc.overdueServicesCount++;
                                            if (["In repair", "Broken"].includes(curr.AMStatus)) acc.repairsRequiredCount++;
                                            acc.assetValue += Number(curr.PurchasePrice) || 0;
                                            return acc;
                                        },
                                        {
                                            totalAssetsCount: 0,
                                            repairsRequiredCount: 0,
                                            assetValue: 0,
                                            overdueServicesCount: 0,
                                            serviceDueCountOneMonth: 0,
                                        } as IAssetMaster
                                    );

                                    const idx = SiteItems.findIndex((r) => r.ID === site.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], AssetMaster: stats };
                                });
                                break;
                            }

                            case "SitesAssociatedChemical": {
                                SiteItems.forEach((site) => {
                                    const related = getSiteRelatedItems(rawItems, site.ID);

                                    const counts = related.reduce(
                                        (acc, curr) => {
                                            const isExpired = _isExpired(curr.MasterExpirationDate);
                                            const isExpiringSoon = curr.MasterExpirationDate
                                                ? isWithinNextMonthRangeOnlyOneMonth(
                                                    new Date(curr.MasterExpirationDate).toISOString()
                                                )
                                                : false;

                                            if (isExpired) acc.expiredCount++;
                                            if (isExpiringSoon) acc.expiringSoonCount++;
                                            if (curr.Hazardous === "Yes") acc.hazardousCount++;
                                            if (curr.Hazardous === "No") acc.nonHazardousCount++;
                                            return acc;
                                        },
                                        {
                                            totalChemicalCount: related.length || 0,
                                            expiringSoonCount: 0,
                                            expiredCount: 0,
                                            hazardousCount: 0,
                                            nonHazardousCount: 0,
                                        } as ISitesAssociatedChemical
                                    );

                                    const idx = SiteItems.findIndex((r) => r.ID === site.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], SitesAssociatedChemical: counts };
                                });
                                break;
                            }

                            default:
                                break;
                        }
                    }
                    categoryOptions = getUniueRecordsByColumnName(categoryOptions, "value")
                    let cards = getCardCount(SiteItems);
                    setState((prev: any) => ({
                        ...prev,
                        cards: cards,
                        sortingColumn: { key: "", isSorted: "" },
                        allItems: SiteItems,
                        filterItems: SiteItems,
                        isReloadItems: !prev.isReloadItems,
                        selectedStates: [],
                        selectedSiteIds: [],
                        selectedStatesId: [],
                        selectedSiteTitles: [],
                        selectedSCSites: [],
                        siteCategoryOptions: categoryOptions,
                        selectedCategory: [],
                        selectedCards: "",
                        keyUpdate: Math.random(),
                        isLoading: false,
                    }));
                }

                /**
                 * get the Sub list load in back side
                 */

                let subListData = await fetchFromMultipleLists(childList, commonFields);
                if (Array.isArray(subListData) && subListData.length > 0) {
                    const subItems: Record<string, any> = {};

                    // ---------- Helper functions ----------
                    const safeList = (data: any) => (Array.isArray(data?.items) ? data.items : []);

                    const countByField = (
                        list: any[],
                        field: string,
                        expectedValue: string | string[]
                    ) =>
                        list.filter((item) => {
                            const val = item?.[field];
                            return Array.isArray(expectedValue)
                                ? expectedValue.includes(val)
                                : val === expectedValue;
                        }).length;

                    const makeCountObject = (
                        list: any[],
                        submitField = "FormStatus",
                        submitValues = ["submit", "Submitted"],
                        draftValues = ["draft", "Draft"]
                    ): IQuaySafeTab => ({
                        totalCount: list.length,
                        submittedCount: countByField(list, submitField, submitValues),
                        draftCount: countByField(list, submitField, draftValues),
                    });

                    // ---------- Main Switch ----------
                    for (const element of subListData) {
                        const key = element.key;


                        switch (key) {
                            // -----------------------------------------
                            // Generic submit/draft count categories
                            // -----------------------------------------
                            case "ToolboxTalk":
                            case "ToolboxIncident":
                            case "CorrectiveActionReport":
                            case "WorkplaceInspectionChecklist":
                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItems = safeList(element);
                                    filterItems = getSiteRelatedItems(filterItems, elementSite.ID);
                                    let obj = makeCountObject(filterItems, "FormStatus");

                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: obj };
                                }

                                break;

                            case "SkillMatrix":
                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemstwo = safeList(element);
                                    filterItemstwo = getSiteRelatedItems(filterItemstwo, elementSite.ID);
                                    let objTwo = makeCountObject(filterItemstwo, "CalcFormStatus", [
                                        "Submitted",
                                    ], ["Draft"]);

                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objTwo };
                                }

                                break;

                            case "SiteSafetyAudit":
                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemsTheree = safeList(element);
                                    filterItemsTheree = getSiteRelatedItems(filterItemsTheree, elementSite.ID);
                                    let objectThree = makeCountObject(filterItemsTheree, "FormStatus", [
                                        "submit",
                                        "Submitted",
                                    ]);

                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectThree };
                                }

                                break;

                            // -----------------------------------------
                            // Single total count only
                            // -----------------------------------------
                            case "WHSCommitteeMeetingAgenda":
                            case "WHSCommitteeMeeting":
                            case "Periodic":
                            case "URLLink":
                            case "DocumentsLink":
                            case "SiteDocuments":
                            case "ClientResponse":

                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemsFour = safeList(element);
                                    filterItemsFour = getSiteRelatedItems(filterItemsFour, elementSite.ID);
                                    let objectFour = { totalCount: filterItemsFour.length };

                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectFour };
                                }

                                break;

                            // -----------------------------------------
                            // JobControlChecklistDetails
                            // -----------------------------------------
                            case "JobControlChecklistDetails": {

                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemsFive = safeList(element);
                                    filterItemsFive = getSiteRelatedItems(filterItemsFive, elementSite.ID);
                                    const notYetCheckedCount = countByField(filterItemsFive, "Status", "Not Yet Checked");
                                    let objectFive = {
                                        totalCount: filterItemsFive.length,
                                        notYetCheckedCount,
                                    };
                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectFive };
                                }

                                break;
                            }

                            // -----------------------------------------
                            // EventMaster
                            // -----------------------------------------
                            case "EventMaster": {
                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemsSix = safeList(element);
                                    filterItemsSix = getSiteRelatedItems(filterItemsSix, elementSite.ID);
                                    const eventDateTimeCount = filterItemsSix.reduce(
                                        (count: any, data: any) =>
                                            data?.EventDateTime && isUpcomingDate(data["EventDateTime."])
                                                ? count + 1
                                                : count,
                                        0
                                    );
                                    let objectSix = {
                                        totalCount: filterItemsSix.length,
                                        eventDateTimeCount,
                                    };
                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectSix };
                                }
                                break;
                            }

                            // -----------------------------------------
                            // SitesAssociatedTeam
                            // -----------------------------------------
                            case "SitesAssociatedTeam": {

                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];

                                    let filterItemsSeven = safeList(element);
                                    filterItemsSeven = getSiteRelatedItems(filterItemsSeven, elementSite.ID);
                                    let atRoleGroup = processATRoles(filterItemsSeven)
                                    let objectEight = {
                                        totalCount: filterItemsSeven.length,
                                        atRoleGroup: atRoleGroup.top3,
                                        all: atRoleGroup.all
                                    };
                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectEight };
                                }
                                break;
                            }

                            // -----------------------------------------
                            // HelpDesk
                            // -----------------------------------------
                            case "HelpDesk": {

                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemsEight = safeList(element);
                                    filterItemsEight = getSiteRelatedItems(filterItemsEight, elementSite.ID);
                                    const stats = filterItemsEight.reduce(
                                        (acc: any, item: any) => {
                                            switch (item?.QCPriority) {
                                                case "High":
                                                    acc.highCount++;
                                                    break;
                                                case "Low":
                                                    acc.lowCount++;
                                                    break;
                                                case "Medium":
                                                    acc.mediumCount++;
                                                    break;
                                            }
                                            if (item?.HDStatus === "Pending") acc.pendingCount++;
                                            return acc;
                                        },
                                        { lowCount: 0, highCount: 0, mediumCount: 0, pendingCount: 0 }
                                    );

                                    let objectSeven = {
                                        totalCount: filterItemsEight.length,
                                        ...stats,
                                    };
                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectSeven };
                                }
                                break;
                            }

                            // -----------------------------------------
                            // AuditInspectionData
                            // -----------------------------------------
                            case "AuditInspectionData": {

                                for (let index = 0; index < SiteItems.length; index++) {
                                    const elementSite = SiteItems[index];
                                    let filterItemsNine = safeList(element);
                                    filterItemsNine = getSiteRelatedItems(filterItemsNine, elementSite.ID);
                                    const score = getScoreStatsWithOwners(filterItemsNine);
                                    let objectNine = {
                                        totalCount: filterItemsNine.length,
                                        averageScore: score.average || 0,
                                        lowScore: score.low || 0,
                                        highScore: score.high || 0,
                                        OwnerCount: score.uniqueOwnerCount || 0,
                                    };
                                    const idx = SiteItems.findIndex((r) => r.ID === elementSite.ID);
                                    if (idx > -1) SiteItems[idx] = { ...SiteItems[idx], [key]: objectNine };
                                }
                                break;
                            }

                            default:
                                break;
                        }
                    }

                    // ---------- Final State Update ----------
                    setState((prev: any) => ({
                        ...prev,
                        allItems: SiteItems,
                        isReloadItems: !prev.isReloadItems,
                        isGettingSubList: false,
                        filterItems: SiteItems,
                        // siteDetailViewItems: subListData,
                        keyUpdate: Math.random(),
                    }));
                }



                // }


            } catch (error) {
                console.log(error);
                setState((prevState) => ({ ...prevState, isLoading: false }))

            }
        })()

    }, [state.filterFromDate, state.filterToDate])

    return {
        state,
        onChangeRangeOption,
        onChangeFromDate,
        onChangeToDate,
        onChangeCategory,
        handleSiteChange,
        onStateChange,
        onClickApplyFilter,
        onClickCard,
        onClickConfigureColumn,
        onClickDismissPanel,
        _onChangeConfigurationColumn,
        onClickConfigureColumnSave,
        exportToExcel,
        onClickRow,
        handlePagination,
        onClickHeader
    }
}