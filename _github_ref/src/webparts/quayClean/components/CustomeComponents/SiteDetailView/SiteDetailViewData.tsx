/* eslint-disable */
import React from "react"
import { ISiteDetailViewProps } from "./SiteDetailView";
import { _isExpired, _isOverdue, _isWithinNextMonthRange, generateAndSaveKendoPDFHelpDesk, genratePDFSiteSummeryDetails, getCAMLQueryFilterExpression, getScoreStatsWithOwners, isUpcomingDate, isWithinNextMonthRange, isWithinNextMonthRangeOnlyOneMonth, mapSingleValue, processATRoles } from "../../../../../Common/Util";
import { Provider, useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import CamlBuilder from "camljs";
import { defaultValues, ListNames, WHSCommitteeMeetingTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { IAssetMaster, IConfigurationColumn, IQuaySafeTab, ISiteDetailViewItems, ISitesAssociatedChemical, ISitesMasterDetails } from "./SiteDetailViewInterface";
import { DataType } from "../../../../../Common/Constants/CommonConstants";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import moment from "moment";
import { toastService } from "../../../../../Common/ToastService";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { IDropdownOption } from "@fluentui/react";

export interface ISiteDetailViewDataState {
    isLoading: boolean;
    siteDetailViewItems: ISiteDetailViewItems;
    keyUpdate: number;
    selectedSiteId: number;
    isGeneratePDF: boolean;
    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;
    selectedDateRangeItem: any;
    fromDate: Date | any;
    toDate: Date | any;
    filterFromDate: any
    filterToDate: any;
    isApplyFilter: boolean;
    isApplyFilterDisable: boolean;
    mainListData: any[];
    subListData: any[]
    isConfigurePanelOpen: boolean;
    configurationColumn: IConfigurationColumn[];
    finalConfigurationColumn: IConfigurationColumn[];
    isRegenerateCreated: boolean;
    isRegenerate: boolean;
    isConfigurationSaveDisable: boolean;
    isShowLoader: boolean;

}

export const SiteDetailViewData = (props: ISiteDetailViewProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail, context, currentUser } = appGlobalState;

    const [state, setState] = React.useState<ISiteDetailViewDataState>({
        isLoading: false,
        isShowLoader: false,
        isRegenerate: false,
        isConfigurationSaveDisable: false,
        isRegenerateCreated: false,
        isConfigurePanelOpen: false,
        finalConfigurationColumn: [
            { label: "Select All", value: true },
            { label: "At a Glance", value: true },
            { label: "Configuration Settings", value: true },
            { label: "Key Contacts", value: true },
            { label: "Equipment & Assets", value: true, isParent: true },
            { label: "Assets Value", value: true, parent: "Equipment & Assets", display: "Assets Value ($)" },
            { label: "Chemicals", value: true },
            { label: "Quaysafe Modules", value: true, isParent: true },
            { label: "Toolbox Talks", value: true, parent: "Quaysafe Modules" },
            { label: "Corrective Action", value: true, parent: "Quaysafe Modules" },
            { label: "Incident Reports", value: true, parent: "Quaysafe Modules" },
            { label: "WHS Committee Inspection", value: true, parent: "Quaysafe Modules" },
            { label: "Skill Matrix", value: true, parent: "Quaysafe Modules" },
            { label: "WHS Committee Meeting", value: true, parent: "Quaysafe Modules" },
            { label: "Workplace Inspection", value: true, parent: "Quaysafe Modules" },
            { label: "WHS Committee Agenda", value: true, parent: "Quaysafe Modules" },
            { label: "Assigned Team", value: true },
            { label: "Help Desk", value: true },
            { label: "Document Library", value: true },
            { label: "Safety Culture", value: true },
            { label: "Site KPI's", value: true },
            { label: "Events", value: true },
            { label: "Periodic Tasks", value: true },
        ],
        configurationColumn: [
            { label: "Select All", value: true },
            { label: "At a Glance", value: true },
            { label: "Configuration Settings", value: true },
            { label: "Key Contacts", value: true },
            { label: "Equipment & Assets", value: true, isParent: true },
            { label: "Assets Value", value: true, parent: "Equipment & Assets", display: "Assets Value ($)" },
            { label: "Chemicals", value: true },
            { label: "Quaysafe Modules", value: true, isParent: true },
            { label: "Toolbox Talks", value: true, parent: "Quaysafe Modules" },
            { label: "Corrective Action", value: true, parent: "Quaysafe Modules" },
            { label: "Incident Reports", value: true, parent: "Quaysafe Modules" },
            { label: "WHS Committee Inspection", value: true, parent: "Quaysafe Modules" },
            { label: "Skill Matrix", value: true, parent: "Quaysafe Modules" },
            { label: "WHS Committee Meeting", value: true, parent: "Quaysafe Modules" },
            { label: "Workplace Inspection", value: true, parent: "Quaysafe Modules" },
            { label: "WHS Committee Agenda", value: true, parent: "Quaysafe Modules" },
            { label: "Assigned Team", value: true },
            { label: "Help Desk", value: true },
            { label: "Document Library", value: true },
            { label: "Safety Culture", value: true },
            { label: "Site KPI's", value: true },
            { label: "Events", value: true },
            { label: "Periodic Tasks", value: true },
        ],
        mainListData: [],
        subListData: [],
        fromDate: "",
        filterFromDate: moment(new Date()).subtract(29, 'days').format(defaultValues.FilterDateFormate),
        filterToDate: moment(new Date()).format(defaultValues.FilterDateFormate),
        toDate: "",
        selectedDateRangeItem: { value: 'Last 30 Days', key: 'Last 30 Days', text: 'Last 30 Days', label: 'Last 30 Days' },
        isGeneratePDF: false,
        isApplyFilterDisable: true,
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isPopupVisible: false,
        isApplyFilter: true,
        keyUpdate: Math.random(),
        selectedSiteId: props.siteMasterId || 0,
        siteDetailViewItems: {
            AuditInspectionData: {
                totalCount: 0,
                averageScore: "",
                lowScore: "",
                highScore: "",
                OwnerCount: 0
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
            SiteDocuments: {
                totalCount: 0
            },
            URLLink: {
                totalCount: 0
            },
            DocumentsLink: {
                totalCount: 0
            },
            SitesAssociatedTeam: {
                totalCount: 0,
                atRoleGroup: [],
                all: []
            },
            EventMaster: {
                totalCount: 0,
                eventDateTimeCount: 0
            },
            SitesMasterDetails: {
                name: "",
                state: "",
                category: "",
                lastReportGeneratedDate: undefined,
                whoGenerated: undefined,
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
                dynamicSiteManagerId: 0,
                dynamicSiteManager: {
                    Id: 0,
                    emailId: "",
                    title: ""
                }
            },
            AssetMaster: {
                totalAssetsCount: 0,
                repairsRequiredCount: 0,
                assetValue: 0,
                overdueServicesCount: 0,
                serviceDueCountOneMonth: 0
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
            WHSCommitteeMeeting: { totalCount: 0 },
            WHSCommitteeMeetingAgenda: { totalCount: 0 },
            Periodic: {
                totalCount: 0
            },
            JobControlChecklistDetails: {
                totalCount: 0,
                notYetCheckedCount: 0
            },
            summeryDetail: {
                reportDate: "",
                generatedBy: ""
            },
            dateRange: {
                startDate: "",
                endDate: ""
            },
            ToolboxTalkDateRange: {
                totalCount: 0,
                submittedCount: 0,
                draftCount: 0
            },
            ToolboxIncidentDateRange: {
                totalCount: 0,
                submittedCount: 0,
                draftCount: 0
            },
            SkillMatrixDateRange: {
                totalCount: 0,
                submittedCount: 0,
                draftCount: 0
            },
            CorrectiveActionReportDateRange: {
                totalCount: 0,
                submittedCount: 0,
                draftCount: 0
            },
            WorkplaceInspectionChecklistDateRange: {
                totalCount: 0,
                submittedCount: 0,
                draftCount: 0
            },
            SiteSafetyAuditDateRange: {
                totalCount: 0,
                submittedCount: 0,
                draftCount: 0
            },
            WHSCommitteeMeetingDateRange: {
                totalCount: 0
            },
            WHSCommitteeMeetingAgendaDateRange: {
                totalCount: 0
            },
            PeriodicDateRange: {
                totalCount: 0
            },
            JobControlChecklistDetailsDateRange: {
                totalCount: 0,
                notYetCheckedCount: 0
            },
            EventMasterDateRange: {
                totalCount: 0,
                eventDateTimeCount: 0
            },
            ClientResponseDateRange: {
                totalCount: 0
            },
            HelpDeskDateRange: {
                totalCount: 0,
                lowCount: 0,
                highCount: 0,
                pendingCount: 0,
                mediumCount: 0
            },
            AuditInspectionDataDateRange: {
                totalCount: 0,
                averageScore: "",
                lowScore: "",
                highScore: "",
                OwnerCount: undefined
            },
            URLLinkDateRange: {
                totalCount: 0
            },
            DocumentsLinkDateRange: {
                totalCount: 0
            },
            SiteDocumentsDateRange: {
                totalCount: 0
            },
            SitesAssociatedTeamDateRange: {
                totalCount: 0,
                atRoleGroup: [],
                all: []
            },
            AssetMasterDateRange: {
                totalAssetsCount: 0,
                repairsRequiredCount: 0,
                overdueServicesCount: 0,
                serviceDueCountOneMonth: 0,
                assetValue: 0
            },
            SitesAssociatedChemicalDateRange: {
                totalChemicalCount: 0,
                expiringSoonCount: 0,
                expiredCount: 0,
                hazardousCount: 0,
                nonHazardousCount: 0
            }
        }
    });

    const onClickDownload = async (): Promise<void> => {
        setState((prevState) => ({ ...prevState, isGeneratePDF: true, isLoading: true }));
        setTimeout(async () => {
            const fileName = `Site Audit Report-${state?.siteDetailViewItems?.SitesMasterDetails?.name}`
            await genratePDFSiteSummeryDetails("pdfGenrate", fileName, false, true);
            const el = document.getElementById("pdfGenrate");
            if (el) {
                el.style.removeProperty("font-family");
            }
            setState((prevState) => ({ ...prevState, isGeneratePDF: false, isLoading: false }));
        }, 500);

    };

    const onChangeRangeOption = (item: any): void => {
        if (item?.key == "Custom Range") {
            setState((prevState: any) => ({ ...prevState, selectedDateRangeItem: item, filterFromDate: "", filterToDate: "" }));
        } else if (!!item && item.key == "All") {
            setState((prevState: any) => ({ ...prevState, selectedDateRangeItem: "", isApplyFilterDisable: false, filterFromDate: "", filterToDate: "", fromDate: "", toDate: "" }));
        }
        else if (!!item) {
            setState((prevState: any) => ({ ...prevState, selectedDateRangeItem: item, isApplyFilterDisable: false }));
        } else {
            setState((prevState: any) => ({ ...prevState, selectedDateRangeItem: "", isApplyFilterDisable: false, filterFromDate: "", filterToDate: "", fromDate: "", toDate: "" }));
        }

    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState((prevState: any) => ({ ...prevState, filterToDate: filterDate, toDate: date, isApplyFilterDisable: false }))

    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState((prevState: any) => ({ ...prevState, filterFromDate: filterDate, fromDate: date, isApplyFilterDisable: false }))
    };


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

    const onSiteChange = (options: any) => {
        setState((prevState: any) => ({ ...prevState, selectedSiteId: options.value, isApplyFilterDisable: false, isRegenerateCreated: false }));
    }


    const onClickShowEmailModel = () => {
        setState((prevState) => ({ ...prevState, isPopupVisible: true }))
    }

    const onClickCancel = () => {

        setState((prevState: any) => ({ ...prevState, title: "", sendToEmail: "", displayError: false, displayErrorEmail: false, displayErrorTitle: false, isPopupVisible: false }))
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setState((prevState: any) => ({ ...prevState, title: newValue || "", displayErrorTitle: !!newValue ? false : prevState.displayErrorTitle }))

    }

    const onClickApplyFilter = () => {
        setState((prevState: any) => ({
            ...prevState,
            isApplyFilter: !prevState.isApplyFilter,
            isRegenerate: (state.mainListData.length == 0 || state.subListData.length == 0) ? true : prevState.isRegenerate,
            isRegenerateCreated: (state.mainListData.length == 0 || state.subListData.length == 0) ? false : prevState.isRegenerateCreated
        }))
    }

    const onClickConfigureColumnSave = async () => {
        try {
            const toastId = toastService.loading('Saving Column...');
            const toastMessage = 'Configuration has been updated successfully!';
            setState((prevState) => ({ ...prevState, isLoading: true }));

            await provider.updateItem({ SiteAuditPrintConfiguredColumn: JSON.stringify(state.finalConfigurationColumn) }, ListNames.SitesMaster, Number(props.siteMasterId))

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            setState((prevState) => ({
                ...prevState, isConfigurePanelOpen: false, isLoading: false, isConfigurationSaveDisable: true,
                configurationColumn: state.finalConfigurationColumn,
            }));
        } catch (error) {
            console.log(error);

            setState((prevState) => ({ ...prevState, isConfigurePanelOpen: false, isLoading: false, }));
        }

    }

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {

        setState((prevState: any) => ({ ...prevState, sendToEmail: newValue || "", displayErrorEmail: !!newValue ? false : prevState.displayErrorEmail }))



        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        if (!enteredValue || emailPattern.test(enteredValue)) {

            setState((prevState: any) => ({ ...prevState, displayError: false }))
        } else {

            setState((prevState: any) => ({ ...prevState, displayError: true }))
        }
    };

    const onClickSendEmail = async (): Promise<void> => {
        const isTitleEmpty = !state.title;
        const isEmailEmpty = !state.sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !state.sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
        setState((prevState: any) => ({ ...prevState, displayError: isEmailInvalid, displayErrorEmail: isEmailEmpty, displayErrorTitle: isTitleEmpty, isLoading: true }))
        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            const fileName = `Site Audit Report-${state?.siteDetailViewItems?.SitesMasterDetails?.name}`
            setState((prevState: any) => ({ ...prevState, isGeneratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await genratePDFSiteSummeryDetails("pdfGenrate", fileName, false, false);
                const el = document.getElementById("pdfGenrate");
                if (el) {
                    el.style.removeProperty("font-family");
                }
                const file: IFileWithBlob = {
                    file: fileblob,
                    name: `${fileName}.pdf`,
                    overwrite: true
                };
                let toastMessage: string = "";
                const toastId = toastService.loading('Loading...');
                toastMessage = 'Email sent successfully!';
                const insertData: any = {
                    Title: state.title,
                    SendToEmail: state.sendToEmail,
                    StateName: state.siteDetailViewItems.SitesMasterDetails.state,
                    SiteName: state.siteDetailViewItems.SitesMasterDetails.name,
                    EmailType: "SiteSummeryDetails",
                };
                provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                    provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                        console.log("Upload Success");
                    }).catch((err: any) => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onClickCancel();
                    setState((prevState: any) => ({ ...prevState, isGeneratePDF: false, isLoading: false }))
                }).catch((err: any) => console.log(err));
                setState((prevState: any) => ({ ...prevState, isGeneratePDF: false, isLoading: false }))
            }, 1000);

        } else {
            setState((prevState: any) => ({ ...prevState, isGeneratePDF: false, isLoading: false }))
        }
    };


    const filterData = (data: any[], startDate: any, endDate: any) => {
        if (!!data && data?.length > 0) {
            let filterData = data.filter((i) => {

                const dateOnly = i["Created."].split("T")[0];
                return (!startDate && !endDate) ? true : dateOnly >= startDate && dateOnly <= endDate;
            })
            return filterData
        } else {
            return []
        }


    }

    // const _onChangeConfigurationColumn = (label: string, index: number, isParent: boolean, isChecked?: boolean) => {
    //     const { finalConfigurationColumn } = state;
    //     let UpdatedColumn = finalConfigurationColumn
    //     UpdatedColumn[index] = { ...UpdatedColumn[index], value: isChecked || false }

    //     if (label == "Select All") {
    //         UpdatedColumn = UpdatedColumn.map((i) => {
    //             return { ...i, value: isChecked || false, disable: false }

    //         })
    //     }

    //     if (isParent) {
    //         UpdatedColumn = UpdatedColumn.map((i) => {
    //             if (i.parent == label) {
    //                 return { ...i, value: isChecked || false, disable: isChecked == true ? false : true }
    //             } else {
    //                 {
    //                     return i
    //                 }
    //             }

    //         })
    //     }
    //     // const filterColumn = column.filter((i: any) => i.label != "Select All" && i.value == true)?.length;
    //     const filterColumn = UpdatedColumn.filter((i: any) => i.label != "Select All" && i.value == true)?.length;
    //     const isAllSelect = (finalConfigurationColumn.length - 1) == filterColumn
    //     if (label != "Select All") {
    //         UpdatedColumn[0] = { ...UpdatedColumn[0], value: isAllSelect }
    //     }
    //     setState((prevState) => ({
    //         ...prevState, finalConfigurationColumn: UpdatedColumn,
    //         isConfigurationSaveDisable: false
    //     }));
    // }

    const _onChangeConfigurationColumn = (
        label: string,
        index: number,
        isParent: boolean,
        isChecked?: boolean
    ) => {
        setState((prevState) => {
            let UpdatedColumn = [...prevState.finalConfigurationColumn.map((col) => ({ ...col }))];

            UpdatedColumn[index] = { ...UpdatedColumn[index], value: isChecked || false };

            if (label === "Select All") {
                UpdatedColumn = UpdatedColumn.map((col) => ({
                    ...col,
                    value: isChecked || false,
                    disable: false,
                }));
            }

            if (isParent) {
                UpdatedColumn = UpdatedColumn.map((col) => {
                    if (col.parent === label) {
                        return {
                            ...col,
                            value: isChecked || false,
                            disable: isChecked ? false : true,
                        };
                    }
                    return col;
                });
            }

            const filterColumn = UpdatedColumn.filter(
                (col) => col.label !== "Select All" && col.value === true
            ).length;

            const isAllSelect = UpdatedColumn.length - 1 === filterColumn;

            if (label !== "Select All") {
                UpdatedColumn[0] = { ...UpdatedColumn[0], value: isAllSelect };
            }

            return {
                ...prevState,
                finalConfigurationColumn: UpdatedColumn,
                isConfigurationSaveDisable: false,
            };
        });
    };


    const onClickConfigureColumn = () => {
        setState((prevState) => ({ ...prevState, isConfigurePanelOpen: true }));
    }
    const onClickConfigureClose = () => {
        setState((prevState) => ({ ...prevState, isConfigurePanelOpen: false, finalConfigurationColumn: state.configurationColumn }));
    }


    const filterDateRange = (defaultProperties: any, allListData: any[], startDate: string, endDate: string) => {
        let items = defaultProperties;
        if (!!allListData && allListData.length > 0) {
            let subItems: any = {}
            for (let index = 0; index < allListData.length; index++) {
                const element = allListData[index];
                switch (element.key) {
                    case "ToolboxTalk":
                        let toolboxTalkItems = (!!element.items && element.items.length > 0) ? element.items : []

                        toolboxTalkItems = filterData(toolboxTalkItems, startDate, endDate)
                        let obj: IQuaySafeTab = {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        }
                        if (!!toolboxTalkItems && toolboxTalkItems.length > 0) {
                            let submittedCount: number = 0;
                            let draftCount: number = 0;
                            for (let index = 0; index < toolboxTalkItems.length; index++) {
                                const currentItem = toolboxTalkItems[index]
                                if (currentItem.FormStatus == "submit") {
                                    submittedCount++;
                                }
                                if (currentItem.FormStatus == "draft") {
                                    draftCount++;
                                }
                            }
                            obj = {
                                totalCount: toolboxTalkItems.length || 0,
                                submittedCount: submittedCount || 0,
                                draftCount: draftCount || 0
                            }
                        }
                        subItems["ToolboxTalkDateRange"] = obj
                        break;
                    case "ToolboxIncident":
                        let toolboxIncidentItems = (!!element.items && element.items.length > 0) ? element.items : []
                        toolboxIncidentItems = filterData(toolboxIncidentItems, startDate, endDate)
                        let obj2: IQuaySafeTab = {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        }
                        if (!!toolboxIncidentItems && toolboxIncidentItems.length > 0) {
                            let submittedCount: number = 0;
                            let draftCount: number = 0;
                            for (let index = 0; index < toolboxIncidentItems.length; index++) {
                                const currentItem = toolboxIncidentItems[index]
                                if (currentItem.FormStatus == "submit") {
                                    submittedCount++;
                                }
                                if (currentItem.FormStatus == "draft") {
                                    draftCount++;
                                }
                            }
                            obj2 = {
                                totalCount: toolboxIncidentItems.length || 0,
                                submittedCount: submittedCount || 0,
                                draftCount: draftCount || 0
                            }
                        }
                        subItems["ToolboxIncidentDateRange"] = obj2
                        break;
                    case "SkillMatrix":
                        let skillMatrixItems = (!!element.items && element.items.length > 0) ? element.items : [];
                        skillMatrixItems = filterData(skillMatrixItems, startDate, endDate)
                        let obj3: IQuaySafeTab = {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        }
                        if (!!skillMatrixItems && skillMatrixItems.length > 0) {
                            let submittedCount: number = 0;
                            let draftCount: number = 0;
                            for (let index = 0; index < skillMatrixItems.length; index++) {
                                const currentItem = skillMatrixItems[index]
                                if (currentItem.CalcFormStatus == "Submitted") {
                                    submittedCount++;
                                }
                                if (currentItem.CalcFormStatus == "Draft") {
                                    draftCount++;
                                }
                            }
                            obj3 = {
                                totalCount: skillMatrixItems.length || 0,
                                submittedCount: submittedCount || 0,
                                draftCount: draftCount || 0
                            }
                        }
                        subItems["SkillMatrixDateRange"] = obj3
                        break;
                    case "CorrectiveActionReport":
                        let correctiveActionReportItems = (!!element.items && element.items.length > 0) ? element.items : []
                        correctiveActionReportItems = filterData(correctiveActionReportItems, startDate, endDate)
                        let obj4: IQuaySafeTab = {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        }
                        if (!!correctiveActionReportItems && correctiveActionReportItems.length > 0) {
                            let submittedCount: number = 0;
                            let draftCount: number = 0;
                            for (let index = 0; index < correctiveActionReportItems.length; index++) {
                                const currentItem = correctiveActionReportItems[index]
                                if (currentItem.FormStatus == "submit") {
                                    submittedCount++;
                                }
                                if (currentItem.FormStatus == "draft") {
                                    draftCount++;
                                }
                            }
                            obj4 = {
                                totalCount: correctiveActionReportItems.length || 0,
                                submittedCount: submittedCount || 0,
                                draftCount: draftCount || 0
                            }
                        }
                        subItems["CorrectiveActionReportDateRange"] = obj4
                        break;
                    case "WorkplaceInspectionChecklist":
                        let workplaceInspectionChecklistItems = (!!element.items && element.items.length > 0) ? element.items : [];
                        workplaceInspectionChecklistItems = filterData(workplaceInspectionChecklistItems, startDate, endDate)
                        let obj5: IQuaySafeTab = {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        }
                        if (!!workplaceInspectionChecklistItems && workplaceInspectionChecklistItems.length > 0) {
                            let submittedCount: number = 0;
                            let draftCount: number = 0;
                            for (let index = 0; index < workplaceInspectionChecklistItems.length; index++) {
                                const currentItem = workplaceInspectionChecklistItems[index]
                                if (currentItem.FormStatus == "submit") {
                                    submittedCount++;
                                }
                                if (currentItem.FormStatus == "draft") {
                                    draftCount++;
                                }
                            }
                            obj5 = {
                                totalCount: workplaceInspectionChecklistItems.length || 0,
                                submittedCount: submittedCount || 0,
                                draftCount: draftCount || 0
                            }
                        }
                        subItems["WorkplaceInspectionChecklistDateRange"] = obj5
                        break;
                    case "SiteSafetyAudit":
                        let SiteSafetyAudit = (!!element.items && element.items.length > 0) ? element.items : [];
                        SiteSafetyAudit = filterData(SiteSafetyAudit, startDate, endDate)
                        let obj18: IQuaySafeTab = {
                            totalCount: 0,
                            submittedCount: 0,
                            draftCount: 0
                        }
                        if (!!SiteSafetyAudit && SiteSafetyAudit.length > 0) {
                            let submittedCount: number = 0;
                            let draftCount: number = 0;
                            for (let index = 0; index < SiteSafetyAudit.length; index++) {
                                const currentItem = SiteSafetyAudit[index]
                                if (currentItem.FormStatus == "submit" || currentItem.FormStatus == "Submitted") {
                                    submittedCount++;
                                }
                                if (currentItem.FormStatus == "draft") {
                                    draftCount++;
                                }
                            }
                            obj18 = {
                                totalCount: SiteSafetyAudit.length || 0,
                                submittedCount: submittedCount || 0,
                                draftCount: draftCount || 0
                            }
                        }
                        subItems["SiteSafetyAuditDateRange"] = obj18
                        break;
                    case "WHSCommitteeMeetingAgenda":
                        let WHSCommitteeMeetingAgenda = (!!element.items && element.items.length > 0) ? element.items : [];
                        WHSCommitteeMeetingAgenda = filterData(WHSCommitteeMeetingAgenda, startDate, endDate)
                        let obj6: { totalCount: number } = {
                            totalCount: 0
                        }
                        if (!!WHSCommitteeMeetingAgenda && WHSCommitteeMeetingAgenda.length > 0) {


                            obj6 = {
                                totalCount: WHSCommitteeMeetingAgenda.length || 0,

                            }
                        }
                        subItems["WHSCommitteeMeetingAgendaDateRange"] = obj6

                        break;
                    case "WHSCommitteeMeeting":
                        let WHSCommitteeMeeting = (!!element.items && element.items.length > 0) ? element.items : [];
                        WHSCommitteeMeeting = filterData(WHSCommitteeMeeting, startDate, endDate)
                        let obj7: { totalCount: number } = {
                            totalCount: 0
                        }
                        if (!!WHSCommitteeMeeting && WHSCommitteeMeeting.length > 0) {
                            obj7 = {
                                totalCount: WHSCommitteeMeeting.length || 0,

                            }
                        }
                        subItems["WHSCommitteeMeetingDateRange"] = obj7

                        break;
                    case "Periodic":
                        let Periodic = (!!element.items && element.items.length > 0) ? element.items : [];
                        Periodic = filterData(Periodic, startDate, endDate)
                        let obj8: { totalCount: number } = {
                            totalCount: 0
                        }
                        if (!!Periodic && Periodic.length > 0) {
                            obj8 = {
                                totalCount: Periodic.length || 0,

                            }
                        }
                        subItems["PeriodicDateRange"] = obj8

                        break;
                    case "JobControlChecklistDetails":
                        let JobControlChecklistDetails = (!!element.items && element.items.length > 0) ? element.items : [];
                        JobControlChecklistDetails = filterData(JobControlChecklistDetails, startDate, endDate)
                        let obj9: { totalCount: number, notYetCheckedCount: number } = {
                            totalCount: 0,
                            notYetCheckedCount: 0
                        }
                        if (!!JobControlChecklistDetails && JobControlChecklistDetails.length > 0) {
                            let notYetCheckedCount: number = 0;
                            for (let index = 0; index < JobControlChecklistDetails.length; index++) {
                                const data = JobControlChecklistDetails[index];

                                if (data.Status == "Not Yet Checked") {
                                    notYetCheckedCount++;
                                }


                            }

                            obj9 = {
                                totalCount: JobControlChecklistDetails.length || 0,
                                notYetCheckedCount: notYetCheckedCount

                            }
                        }
                        subItems["JobControlChecklistDetailsDateRange"] = obj9

                        break;
                    case "EventMaster":
                        let EventMaster = (!!element.items && element.items.length > 0) ? element.items : [];
                        EventMaster = filterData(EventMaster, startDate, endDate)
                        let obj10: { totalCount: number, eventDateTimeCount: number } = {
                            totalCount: 0, eventDateTimeCount: 0
                        }
                        if (!!EventMaster && EventMaster.length > 0) {
                            let eventDateTimeCount: number = 0;
                            for (let index = 0; index < EventMaster.length; index++) {
                                const data = EventMaster[index];

                                if (!!data.EventDateTime) {
                                    if (isUpcomingDate(data['EventDateTime.']))
                                        eventDateTimeCount++;
                                }


                            }

                            obj10 = {
                                totalCount: EventMaster.length || 0,
                                eventDateTimeCount: eventDateTimeCount
                            }
                        }
                        subItems["EventMasterDateRange"] = obj10

                        break;
                    case "HelpDesk":
                        let HelpDesk = (!!element.items && element.items.length > 0) ? element.items : [];
                        HelpDesk = filterData(HelpDesk, startDate, endDate)
                        let obj15: { totalCount: number, lowCount: number, highCount: number, pendingCount: number, mediumCount: number } = {
                            totalCount: 0,
                            lowCount: 0,
                            highCount: 0,
                            pendingCount: 0,
                            mediumCount: 0
                        }
                        if (!!HelpDesk && HelpDesk.length > 0) {
                            let lowCount: number = 0;
                            let highCount: number = 0;
                            let pendingCount: number = 0;
                            let mediumCount: number = 0;
                            for (let index = 0; index < HelpDesk.length; index++) {
                                const currentItem = HelpDesk[index]


                                if (currentItem.QCPriority == "High") {
                                    highCount++;
                                }
                                if (currentItem.QCPriority == "Low") {
                                    lowCount++;
                                }
                                if (currentItem.QCPriority == "Medium") {
                                    mediumCount++;
                                }
                                if (currentItem.HDStatus == "Pending") {
                                    pendingCount++;
                                }
                            }
                            obj15 = {
                                totalCount: HelpDesk.length || 0,
                                lowCount: lowCount || 0,
                                highCount: highCount || 0,
                                pendingCount: pendingCount || 0,
                                mediumCount: mediumCount || 0
                            }
                        }
                        subItems["HelpDeskDateRange"] = obj15

                        break;
                    case "ClientResponse":
                        let ClientResponse = (!!element.items && element.items.length > 0) ? element.items : []
                        ClientResponse = filterData(ClientResponse, startDate, endDate)
                        let obj16: { totalCount: number, } = {
                            totalCount: 0
                        }
                        if (!!ClientResponse && ClientResponse.length > 0) {
                            obj16 = {
                                totalCount: ClientResponse.length || 0,
                            }
                        }
                        subItems["ClientResponseDateRange"] = obj16

                        break;
                    case "AuditInspectionData":
                        let AuditInspectionData = (!!element.items && element.items.length > 0) ? element.items : []
                        AuditInspectionData = filterData(AuditInspectionData, startDate, endDate)
                        let obj17: { totalCount: number, averageScore: any, lowScore: any, highScore: any, OwnerCount: any } = {
                            totalCount: 0,
                            averageScore: 0,
                            lowScore: 0,
                            highScore: 0,
                            OwnerCount: 0
                        }

                        if (!!AuditInspectionData && AuditInspectionData.length > 0) {
                            let score = getScoreStatsWithOwners(AuditInspectionData)
                            obj17 = {
                                totalCount: AuditInspectionData.length || 0,
                                averageScore: score.average || 0,
                                lowScore: score.low || 0,
                                highScore: score.high || 0,
                                OwnerCount: score.uniqueOwnerCount || 0

                            }
                        }
                        subItems["AuditInspectionDataDateRange"] = obj17

                        break;
                    case "AssetMaster":
                        let assetMasterData = (!!element.items && element.items.length > 0) ? element.items : [];
                        assetMasterData = filterData(assetMasterData, startDate, endDate);
                        let obj19: IAssetMaster = {
                            totalAssetsCount: 0,
                            repairsRequiredCount: 0,
                            assetValue: 0,
                            overdueServicesCount: 0,
                            serviceDueCountOneMonth: 0
                        }
                        if (!!assetMasterData && assetMasterData.length > 0) {
                            let serviceDueMonthCount: number = 0;
                            let overDueCount: number = 0;
                            let repairsRequiredCount: number = 0;
                            let assetValue: number = 0;
                            for (let index = 0; index < assetMasterData.length; index++) {
                                const currentItem = assetMasterData[index]
                                let isDueDate = isWithinNextMonthRangeOnlyOneMonth(currentItem['ServiceDueDate.']);
                                let isOverDue = _isOverdue(currentItem['ServiceDueDate.']);

                                if (isDueDate == true) {
                                    serviceDueMonthCount++;
                                }
                                if (isOverDue) {
                                    overDueCount++;
                                }
                                if (currentItem.AMStatus == "In repair" || currentItem.AMStatus == "Broken") {
                                    repairsRequiredCount++;
                                }
                                if (currentItem.PurchasePrice) {
                                    assetValue += Number(currentItem.PurchasePrice) || 0
                                }

                            }
                            obj19 = {
                                totalAssetsCount: assetMasterData.length || 0,
                                repairsRequiredCount: repairsRequiredCount,
                                assetValue: assetValue,
                                overdueServicesCount: overDueCount,
                                serviceDueCountOneMonth: serviceDueMonthCount
                            }
                        }

                        subItems["AssetMasterDateRange"] = obj19
                        break;

                        break;
                    case "SitesAssociatedChemical":
                        let SitesAssociatedChemical = (!!element.items && element.items.length > 0) ? element.items : []
                        SitesAssociatedChemical = filterData(SitesAssociatedChemical, startDate, endDate);
                        let obj20: ISitesAssociatedChemical = {
                            totalChemicalCount: 0,
                            expiringSoonCount: 0,
                            expiredCount: 0,
                            hazardousCount: 0,
                            nonHazardousCount: 0
                        }
                        let expiredCount: number = 0;
                        let hazardousCount: number = 0;
                        let nonHazardousCount: number = 0;
                        let expiringSoonCount: number = 0;
                        for (let index = 0; index < SitesAssociatedChemical.length; index++) {
                            const currentItem = SitesAssociatedChemical[index]
                            let isExpiredCount = _isExpired(currentItem.MasterExpirationDate);
                            let isExpiringSoon = !!currentItem.MasterExpirationDate ? isWithinNextMonthRangeOnlyOneMonth(new Date(currentItem.MasterExpirationDate).toISOString()) : false;

                            if (isExpiredCount) {
                                expiredCount++;
                            }
                            if (currentItem.Hazardous == "Yes") {
                                hazardousCount++;
                            } else if (currentItem.Hazardous == "No") {
                                nonHazardousCount++;
                            }
                            if (isExpiringSoon) {
                                expiringSoonCount++;
                            }


                        }
                        if (SitesAssociatedChemical) {
                            obj20 = {
                                totalChemicalCount: SitesAssociatedChemical.length || 0,
                                expiringSoonCount: expiringSoonCount,
                                expiredCount: expiredCount || 0,
                                hazardousCount: hazardousCount || 0,
                                nonHazardousCount: nonHazardousCount,
                            }
                        }

                        subItems["SitesAssociatedChemicalDateRange"] = obj20
                        break;


                    case "URLLink":
                        let URLLink = (!!element.items && element.items.length > 0) ? element.items : ""
                        URLLink = filterData(URLLink, startDate, endDate);
                        let obj12: { totalCount: number, } = {
                            totalCount: 0
                        }
                        if (!!URLLink && URLLink.length > 0) {
                            obj12 = {
                                totalCount: URLLink.length || 0,
                            }
                        }
                        subItems["URLLinkDateRange"] = obj12

                        break;
                    case "DocumentsLink":
                        let DocumentsLink = (!!element.items && element.items.length > 0) ? element.items : ""
                        DocumentsLink = filterData(DocumentsLink, startDate, endDate);
                        let obj13: { totalCount: number, } = {
                            totalCount: 0
                        }
                        if (!!DocumentsLink && DocumentsLink.length > 0) {
                            obj13 = {
                                totalCount: DocumentsLink.length || 0,
                            }
                        }
                        subItems["DocumentsLinkDateRange"] = obj13

                        break;
                    case "SiteDocuments":
                        let SiteDocuments = (!!element.items && element.items.length > 0) ? element.items : ""
                        SiteDocuments = filterData(SiteDocuments, startDate, endDate);
                        let obj14: { totalCount: number, } = {
                            totalCount: 0
                        }
                        if (!!SiteDocuments && SiteDocuments.length > 0) {
                            obj14 = {
                                totalCount: SiteDocuments.length || 0,
                            }
                        }
                        subItems["SiteDocumentsDateRange"] = obj14

                        break;
                    case "SitesAssociatedTeam":
                        let SitesAssociatedTeam = (!!element.items && element.items.length > 0) ? element.items : ""
                        SitesAssociatedTeam = filterData(SitesAssociatedTeam, startDate, endDate);
                        let obj11: { totalCount: number, atRoleGroup: any[], all: any[] } = {
                            totalCount: 0,
                            atRoleGroup: [],
                            all: []
                        }
                        if (!!SitesAssociatedTeam && SitesAssociatedTeam.length > 0) {
                            let atRoleGroup = processATRoles(SitesAssociatedTeam)
                            obj11 = {
                                totalCount: SitesAssociatedTeam.length || 0,
                                atRoleGroup: atRoleGroup.top3,
                                all: atRoleGroup.all
                            }
                        }
                        subItems["SitesAssociatedTeamDateRange"] = obj11

                        break;

                    default:
                        break;
                }

            }

            let finalObj = { ...items, ...subItems, };
            return finalObj;
        }
        return { ...items };
    }

    const regenerateReport = () => {
        setState((prevState) => ({ ...prevState, isRegenerate: true, isRegenerateCreated: false }));
    }


    React.useEffect(() => {
        // if (state.filterFromDate, state.filterToDate) {
        setState((prevState) => ({ ...prevState, isShowLoader: true }))
        let obj = filterDateRange(state.siteDetailViewItems, [...state.mainListData, ...state.subListData], state.filterFromDate, state.filterToDate);
        setState((prevState) => ({ ...prevState, siteDetailViewItems: obj, isShowLoader: false }));
        // }
    }, [state.isApplyFilter])


    React.useEffect(() => {
        const commonFields = ["ID", "Title", "SiteName", "Created"];
        let commonFilter: any[] = []
        if (state.filterFromDate && state.filterToDate) {
            commonFilter = [
                { fieldName: `Created`, fieldValue: `${state.filterFromDate}`, fieldType: FieldType.DateTime, LogicalType: LogicalType.GreaterThanOrEqualTo },
                { fieldName: `Created`, fieldValue: `${state.filterToDate}`, fieldType: FieldType.DateTime, LogicalType: LogicalType.LessThanOrEqualTo }

            ]
        }
        const MainListName = [
            {
                key: "SitesMasterDetails", listName: ListNames.SitesMaster, viewFields: ['SiteAuditPrintConfiguredColumn', 'QCState', 'DynamicSiteManager', 'Category', 'SiteManager', 'SiteSupervisor', 'ADUser', 'Periodic', 'HelpDesk', 'ClientResponse', 'JobControlChecklist', 'ManageEvents', 'SSWasteReport', 'AmenitiesFeedbackForm', 'IsDailyCleaningDuties'],
                filterField: [
                    { fieldName: `ID`, fieldValue: state.selectedSiteId, fieldType: FieldType.Number, LogicalType: LogicalType.EqualTo }
                ]
            },
            {
                key: "AssetMaster", listName: ListNames.AssetMaster, viewFields: ["PurchasePrice", "ServiceDueDate", "AMStatus"], filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo }
                ]
            },
            {
                key: "SitesAssociatedChemical", listName: ListNames.SitesAssociatedChemical, viewFields: ["Hazardous", "MasterExpirationDate"], filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `Chemicals`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.IsNotNull }
                ],
                LookupColumnName: { lookUpName: "Chemicals", expandColumnNameOne: "CalcHazardous", expandAliasOne: "Hazardous", expandColumnNameTwo: "ExpirationDate", expandAliasTwo: "MasterExpirationDate" },

            },

        ];
        const childList = [
            {
                key: "ToolboxTalk", listName: ListNames.ToolboxTalk, viewFields: ['SiteName', 'FormStatus'],
                filterField: [

                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]

            },
            {
                key: "ToolboxIncident", listName: ListNames.ToolboxIncident, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }

                ]
            },
            {
                key: "SkillMatrix", listName: ListNames.SkillMatrixInfo,
                viewFields: ['CalcFormStatus', 'SiteName'],

                filterField: [
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                ],
                LookupColumnNameSingle: { lookUpName: "SkillMatrix", expandColumnNameOne: "CalcFormStatus", expandAliasOne: "CalcFormStatus" },
            },

            {
                key: "CorrectiveActionReport", listName: ListNames.CorrectiveActionReport, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]
            },

            {
                key: "WorkplaceInspectionChecklist", listName: ListNames.WorkplaceInspectionChecklist, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]
            },

            {
                key: "SiteSafetyAudit", listName: ListNames.SiteSafetyAudit, viewFields: ['SiteName', 'FormStatus'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }

                ]
            },

            {
                key: "WHSCommitteeMeeting", listName: ListNames.WHSCommitteeMeetingMaster, viewFields: [],
                filterField: [
                    { fieldName: `WHSCommitteeMeetingType`, fieldValue: WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingAgenda, fieldType: FieldType.Choice, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "WHSCommitteeMeetingAgenda", listName: ListNames.WHSCommitteeMeetingMaster, viewFields: [],
                filterField: [
                    { fieldName: `WHSCommitteeMeetingType`, fieldValue: WHSCommitteeMeetingTypeEnum.WHSCommitteeMeetingAgenda, fieldType: FieldType.Choice, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "Periodic", listName: ListNames.Periodic, viewFields: [],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "JobControlChecklistDetails", listName: ListNames.JobControlChecklistDetails, viewFields: ['Status', 'Created'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "EventMaster", listName: ListNames.EventMaster, viewFields: ['EventDateTime'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `LinkFor`, fieldValue: "Client Dashboard", fieldType: FieldType.Choice, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsActive`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "SitesAssociatedTeam", listName: ListNames.SitesAssociatedTeam, viewFields: ['ATRole'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "URLLink", listName: ListNames.URLLink, viewFields: [],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "DocumentsLink", listName: ListNames.DocumentsLink, viewFields: [],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "SiteDocuments", listName: ListNames.SiteDocuments, viewFields: ['FSObjType'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `FSObjType`, fieldValue: "0", fieldType: FieldType.Text, LogicalType: LogicalType.EqualTo },

                ]
            },
            {
                key: "HelpDesk", listName: ListNames.HelpDesk, viewFields: ['QCPriority', 'HDStatus'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },

                ]
            },
            {
                key: "ClientResponse", listName: ListNames.ClientResponse, viewFields: [],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: `IsDeleted`, fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
                ]
            },
            {
                key: "AuditInspectionData", listName: ListNames.AuditInspectionData, viewFields: ['Score', 'Owner'],
                filterField: [
                    { fieldName: `SiteName`, fieldValue: state.selectedSiteId, fieldType: FieldType.LookupById, LogicalType: LogicalType.EqualTo },
                    { fieldName: "Archived", fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
                ]
            },


        ];





        (async () => {
            try {
                if (state.selectedSiteId > 0 && state.isRegenerateCreated == false) {
                    /**
                     * Get the first main list
                     */
                    let isRegenerateReport: boolean = state.isRegenerate

                    setState((prevState: any) => ({ ...prevState, isLoading: true, isShowLoader: true, }));

                    let queryOptions: IPnPQueryOptions = {
                        listName: ListNames.SitesMaster,
                        select: ['ID,SiteSummeryDetail,SiteAuditPrintConfiguredColumn'],
                        id: state.selectedSiteId
                    }
                    let siteDetails = await provider.getByItemByIDQuery(queryOptions)
                    if (!!siteDetails && !!siteDetails.SiteAuditPrintConfiguredColumn) {
                        let configurationColumnNew: any[] = JSON.parse(siteDetails.SiteAuditPrintConfiguredColumn);
                        if (!!configurationColumnNew) {
                            setState((prevState: any) => ({ ...prevState, configurationColumn: configurationColumnNew, finalConfigurationColumn: configurationColumnNew }))
                        }

                    }

                    if (!!siteDetails && !!siteDetails?.SiteSummeryDetail && isRegenerateReport == false) {
                        let data = JSON.parse(siteDetails?.SiteSummeryDetail)
                        setState((prevState: any) => ({ ...prevState, isLoading: false, siteDetailViewItems: data, isShowLoader: false, }));
                    } else if (state.isRegenerateCreated == false) {
                        const allData = await fetchFromMultipleLists(MainListName, commonFields);
                        let items: any = {}
                        if (!!allData && allData.length > 0) {

                            for (let index = 0; index < allData.length; index++) {
                                const element = allData[index];
                                switch (element.key) {
                                    case "SitesMasterDetails":
                                        let siteMasterItems = (!!element.items && element.items.length > 0) ? element.items[0] : ""
                                        let obj: ISitesMasterDetails = {
                                            name: "",
                                            state: "",
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
                                            dynamicSiteManagerId: 0,
                                            dynamicSiteManager: {
                                                Id: 0,
                                                emailId: "",
                                                title: ""
                                            }
                                        }
                                        const siteManager = mapSingleValue(siteMasterItems.SiteManager, DataType.peoplePickerMultiple);
                                        const siteSupervisor = mapSingleValue(siteMasterItems.SiteSupervisor, DataType.peoplePickerMultiple);
                                        const adClient = mapSingleValue(siteMasterItems.ADUser, DataType.peoplePickerMultiple);
                                        let totalMember = ((siteManager.length || 0) + (siteSupervisor.length || 0) + (adClient.length || 0));
                                        // let totalMember = siteManager?.length + siteSupervisor.length + adClient?.length;
                                        if (siteMasterItems) {
                                            obj = {
                                                name: mapSingleValue(siteMasterItems.Title, DataType.string),
                                                state: mapSingleValue(siteMasterItems.QCState, DataType.lookupValue),
                                                category: mapSingleValue(siteMasterItems.Category, DataType.string),
                                                siteManager: siteManager,
                                                siteSupervisor: siteSupervisor,
                                                adClient: adClient,
                                                siteManagerId: mapSingleValue(siteMasterItems.SiteManager, DataType.peopleIdMuilt),
                                                siteSupervisorId: mapSingleValue(siteMasterItems.SiteSupervisor, DataType.peopleIdMuilt),
                                                adClientId: mapSingleValue(siteMasterItems.ADUser, DataType.peopleIdMuilt),
                                                lastReportGeneratedDate: "",
                                                whoGenerated: "",
                                                totalMember: totalMember,
                                                periodic: mapSingleValue(siteMasterItems.Periodic, DataType.YesNoTrueOnly),
                                                helpDeskNeeded: mapSingleValue(siteMasterItems.HelpDesk, DataType.YesNoTrueOnly),
                                                clientResponse: mapSingleValue(siteMasterItems.ClientResponse, DataType.YesNoTrueOnly),
                                                jobControlChecklist: mapSingleValue(siteMasterItems.JobControlChecklist, DataType.YesNoTrueOnly),
                                                manageEvents: mapSingleValue(siteMasterItems.ManageEvents, DataType.YesNoTrueOnly),
                                                ssWasteReport: mapSingleValue(siteMasterItems.SSWasteReport, DataType.YesNoTrueOnly),
                                                isDailyCleaningDuties: mapSingleValue(siteMasterItems.IsDailyCleaningDuties, DataType.YesNoTrueOnly),
                                                amenitiesFeedbackForm: mapSingleValue(siteMasterItems.AmenitiesFeedbackForm, DataType.YesNoTrueOnly),
                                                dynamicSiteManagerId: mapSingleValue(siteMasterItems.DynamicSiteManager, DataType.peopleId),
                                                dynamicSiteManager: mapSingleValue(siteMasterItems.DynamicSiteManager, DataType.peoplePicker)


                                            }
                                        }
                                        items["SitesMasterDetails"] = obj;
                                        break;
                                    case "AssetMaster":
                                        let itemsTwo = (!!element.items && element.items.length > 0) ? element.items : [];

                                        let obj2: IAssetMaster = {
                                            totalAssetsCount: 0,
                                            repairsRequiredCount: 0,
                                            assetValue: 0,
                                            overdueServicesCount: 0,
                                            serviceDueCountOneMonth: 0
                                        }
                                        if (!!itemsTwo && itemsTwo.length > 0) {
                                            let serviceDueMonthCount: number = 0;
                                            let overDueCount: number = 0;
                                            let repairsRequiredCount: number = 0;
                                            let assetValue: number = 0;
                                            for (let index = 0; index < itemsTwo.length; index++) {
                                                const currentItem = itemsTwo[index]
                                                let isDueDate = isWithinNextMonthRangeOnlyOneMonth(currentItem['ServiceDueDate.']);
                                                let isOverDue = _isOverdue(currentItem['ServiceDueDate.']);

                                                if (isDueDate == true) {
                                                    serviceDueMonthCount++;
                                                }
                                                if (isOverDue) {
                                                    overDueCount++;
                                                }
                                                if (currentItem.AMStatus == "In repair" || currentItem.AMStatus == "Broken") {
                                                    repairsRequiredCount++;
                                                }
                                                if (currentItem.PurchasePrice) {
                                                    assetValue += Number(currentItem.PurchasePrice) || 0
                                                }

                                            }
                                            obj2 = {
                                                totalAssetsCount: itemsTwo.length || 0,
                                                repairsRequiredCount: repairsRequiredCount,
                                                assetValue: assetValue,
                                                overdueServicesCount: overDueCount,
                                                serviceDueCountOneMonth: serviceDueMonthCount
                                            }
                                        }

                                        items["AssetMaster"] = obj2
                                        break;

                                        break;
                                    case "SitesAssociatedChemical":
                                        let itemsThree = (!!element.items && element.items.length > 0) ? element.items : []
                                        let obj3: ISitesAssociatedChemical = {
                                            totalChemicalCount: 0,
                                            expiringSoonCount: 0,
                                            expiredCount: 0,
                                            hazardousCount: 0,
                                            nonHazardousCount: 0
                                        }
                                        let expiredCount: number = 0;
                                        let hazardousCount: number = 0;
                                        let nonHazardousCount: number = 0;
                                        let expiringSoonCount: number = 0;
                                        for (let index = 0; index < itemsThree.length; index++) {
                                            const currentItem = itemsThree[index]
                                            let isExpiredCount = _isExpired(currentItem.MasterExpirationDate);
                                            let isExpiringSoon = !!currentItem.MasterExpirationDate ? isWithinNextMonthRangeOnlyOneMonth(new Date(currentItem.MasterExpirationDate).toISOString()) : false;

                                            if (isExpiredCount) {
                                                expiredCount++;
                                            }
                                            if (currentItem.Hazardous == "Yes") {
                                                hazardousCount++;
                                            } else if (currentItem.Hazardous == "No") {
                                                nonHazardousCount++;
                                            }
                                            if (isExpiringSoon) {
                                                expiringSoonCount++;
                                            }


                                        }
                                        if (itemsThree) {
                                            obj3 = {
                                                totalChemicalCount: itemsThree.length || 0,
                                                expiringSoonCount: expiringSoonCount,
                                                expiredCount: expiredCount || 0,
                                                hazardousCount: hazardousCount || 0,
                                                nonHazardousCount: nonHazardousCount,
                                            }
                                        }

                                        items["SitesAssociatedChemical"] = obj3
                                        break;

                                        break;

                                    default:
                                        break;
                                }

                            }
                            setState((prevState: any) => ({ ...prevState, siteDetailViewItems: items, keyUpdate: Math.random() }));


                        }
                        /**
                         * get the Sub list load in back side
                         */

                        setState((prevState: any) => ({ ...prevState, isLoading: false }));
                        const subListData = await fetchFromMultipleLists(childList, commonFields);
                        if (!!subListData && subListData.length > 0) {
                            let subItems: any = {}
                            for (let index = 0; index < subListData.length; index++) {
                                const element = subListData[index];
                                switch (element.key) {
                                    case "ToolboxTalk":
                                        let toolboxTalkItems = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj: IQuaySafeTab = {
                                            totalCount: 0,
                                            submittedCount: 0,
                                            draftCount: 0
                                        }
                                        if (!!toolboxTalkItems && toolboxTalkItems.length > 0) {
                                            let submittedCount: number = 0;
                                            let draftCount: number = 0;
                                            for (let index = 0; index < toolboxTalkItems.length; index++) {
                                                const currentItem = toolboxTalkItems[index]
                                                if (currentItem.FormStatus == "submit") {
                                                    submittedCount++;
                                                }
                                                if (currentItem.FormStatus == "draft") {
                                                    draftCount++;
                                                }
                                            }
                                            obj = {
                                                totalCount: toolboxTalkItems.length || 0,
                                                submittedCount: submittedCount || 0,
                                                draftCount: draftCount || 0
                                            }
                                        }
                                        subItems["ToolboxTalk"] = obj
                                        break;
                                    case "ToolboxIncident":
                                        let toolboxIncidentItems = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj2: IQuaySafeTab = {
                                            totalCount: 0,
                                            submittedCount: 0,
                                            draftCount: 0
                                        }
                                        if (!!toolboxIncidentItems && toolboxIncidentItems.length > 0) {
                                            let submittedCount: number = 0;
                                            let draftCount: number = 0;
                                            for (let index = 0; index < toolboxIncidentItems.length; index++) {
                                                const currentItem = toolboxIncidentItems[index]
                                                if (currentItem.FormStatus == "submit") {
                                                    submittedCount++;
                                                }
                                                if (currentItem.FormStatus == "draft") {
                                                    draftCount++;
                                                }
                                            }
                                            obj2 = {
                                                totalCount: toolboxIncidentItems.length || 0,
                                                submittedCount: submittedCount || 0,
                                                draftCount: draftCount || 0
                                            }
                                        }
                                        subItems["ToolboxIncident"] = obj2
                                        break;
                                    case "SkillMatrix":
                                        let skillMatrixItems = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj3: IQuaySafeTab = {
                                            totalCount: 0,
                                            submittedCount: 0,
                                            draftCount: 0
                                        }
                                        if (!!skillMatrixItems && skillMatrixItems.length > 0) {
                                            let submittedCount: number = 0;
                                            let draftCount: number = 0;
                                            for (let index = 0; index < skillMatrixItems.length; index++) {
                                                const currentItem = skillMatrixItems[index]
                                                if (currentItem.CalcFormStatus == "Submitted") {
                                                    submittedCount++;
                                                }
                                                if (currentItem.CalcFormStatus == "Draft") {
                                                    draftCount++;
                                                }
                                            }
                                            obj3 = {
                                                totalCount: skillMatrixItems.length || 0,
                                                submittedCount: submittedCount || 0,
                                                draftCount: draftCount || 0
                                            }
                                        }
                                        subItems["SkillMatrix"] = obj3
                                        break;
                                    case "CorrectiveActionReport":
                                        let correctiveActionReportItems = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj4: IQuaySafeTab = {
                                            totalCount: 0,
                                            submittedCount: 0,
                                            draftCount: 0
                                        }
                                        if (!!correctiveActionReportItems && correctiveActionReportItems.length > 0) {
                                            let submittedCount: number = 0;
                                            let draftCount: number = 0;
                                            for (let index = 0; index < correctiveActionReportItems.length; index++) {
                                                const currentItem = correctiveActionReportItems[index]
                                                if (currentItem.FormStatus == "submit") {
                                                    submittedCount++;
                                                }
                                                if (currentItem.FormStatus == "draft") {
                                                    draftCount++;
                                                }
                                            }
                                            obj4 = {
                                                totalCount: correctiveActionReportItems.length || 0,
                                                submittedCount: submittedCount || 0,
                                                draftCount: draftCount || 0
                                            }
                                        }
                                        subItems["CorrectiveActionReport"] = obj4
                                        break;
                                    case "WorkplaceInspectionChecklist":
                                        let workplaceInspectionChecklistItems = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj5: IQuaySafeTab = {
                                            totalCount: 0,
                                            submittedCount: 0,
                                            draftCount: 0
                                        }
                                        if (!!workplaceInspectionChecklistItems && workplaceInspectionChecklistItems.length > 0) {
                                            let submittedCount: number = 0;
                                            let draftCount: number = 0;
                                            for (let index = 0; index < workplaceInspectionChecklistItems.length; index++) {
                                                const currentItem = workplaceInspectionChecklistItems[index]
                                                if (currentItem.FormStatus == "submit") {
                                                    submittedCount++;
                                                }
                                                if (currentItem.FormStatus == "draft") {
                                                    draftCount++;
                                                }
                                            }
                                            obj5 = {
                                                totalCount: workplaceInspectionChecklistItems.length || 0,
                                                submittedCount: submittedCount || 0,
                                                draftCount: draftCount || 0
                                            }
                                        }
                                        subItems["WorkplaceInspectionChecklist"] = obj5
                                        break;
                                    case "SiteSafetyAudit":
                                        let SiteSafetyAudit = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj18: IQuaySafeTab = {
                                            totalCount: 0,
                                            submittedCount: 0,
                                            draftCount: 0
                                        }
                                        if (!!SiteSafetyAudit && SiteSafetyAudit.length > 0) {
                                            let submittedCount: number = 0;
                                            let draftCount: number = 0;
                                            for (let index = 0; index < SiteSafetyAudit.length; index++) {
                                                const currentItem = SiteSafetyAudit[index]
                                                if (currentItem.FormStatus == "submit" || currentItem.FormStatus == "Submitted") {
                                                    submittedCount++;
                                                }
                                                if (currentItem.FormStatus == "draft") {
                                                    draftCount++;
                                                }
                                            }
                                            obj18 = {
                                                totalCount: SiteSafetyAudit.length || 0,
                                                submittedCount: submittedCount || 0,
                                                draftCount: draftCount || 0
                                            }
                                        }
                                        subItems["SiteSafetyAudit"] = obj18
                                        break;
                                    case "WHSCommitteeMeetingAgenda":
                                        let WHSCommitteeMeetingAgenda = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj6: { totalCount: number } = {
                                            totalCount: 0
                                        }
                                        if (!!WHSCommitteeMeetingAgenda && WHSCommitteeMeetingAgenda.length > 0) {


                                            obj6 = {
                                                totalCount: WHSCommitteeMeetingAgenda.length || 0,

                                            }
                                        }
                                        subItems["WHSCommitteeMeetingAgenda"] = obj6

                                        break;
                                    case "WHSCommitteeMeeting":
                                        let WHSCommitteeMeeting = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj7: { totalCount: number } = {
                                            totalCount: 0
                                        }
                                        if (!!WHSCommitteeMeeting && WHSCommitteeMeeting.length > 0) {
                                            obj7 = {
                                                totalCount: WHSCommitteeMeeting.length || 0,

                                            }
                                        }
                                        subItems["WHSCommitteeMeeting"] = obj7

                                        break;
                                    case "Periodic":
                                        let Periodic = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj8: { totalCount: number } = {
                                            totalCount: 0
                                        }
                                        if (!!Periodic && Periodic.length > 0) {
                                            obj8 = {
                                                totalCount: Periodic.length || 0,

                                            }
                                        }
                                        subItems["Periodic"] = obj8

                                        break;
                                    case "JobControlChecklistDetails":
                                        let JobControlChecklistDetails = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj9: { totalCount: number, notYetCheckedCount: number } = {
                                            totalCount: 0,
                                            notYetCheckedCount: 0
                                        }
                                        if (!!JobControlChecklistDetails && JobControlChecklistDetails.length > 0) {
                                            let notYetCheckedCount: number = 0;
                                            for (let index = 0; index < JobControlChecklistDetails.length; index++) {
                                                const data = JobControlChecklistDetails[index];

                                                if (data.Status == "Not Yet Checked") {
                                                    notYetCheckedCount++;
                                                }


                                            }

                                            obj9 = {
                                                totalCount: JobControlChecklistDetails.length || 0,
                                                notYetCheckedCount: notYetCheckedCount

                                            }
                                        }
                                        subItems["JobControlChecklistDetails"] = obj9

                                        break;
                                    case "EventMaster":
                                        let EventMaster = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj10: { totalCount: number, eventDateTimeCount: number } = {
                                            totalCount: 0, eventDateTimeCount: 0
                                        }
                                        if (!!EventMaster && EventMaster.length > 0) {
                                            let eventDateTimeCount: number = 0;
                                            for (let index = 0; index < EventMaster.length; index++) {
                                                const data = EventMaster[index];

                                                if (!!data.EventDateTime) {
                                                    if (isUpcomingDate(data['EventDateTime.']))
                                                        eventDateTimeCount++;
                                                }


                                            }

                                            obj10 = {
                                                totalCount: EventMaster.length || 0,
                                                eventDateTimeCount: eventDateTimeCount
                                            }
                                        }
                                        subItems["EventMaster"] = obj10

                                        break;
                                    case "SitesAssociatedTeam":
                                        let SitesAssociatedTeam = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj11: { totalCount: number, atRoleGroup: any[], all: any[] } = {
                                            totalCount: 0,
                                            atRoleGroup: [],
                                            all: []
                                        }
                                        if (!!SitesAssociatedTeam && SitesAssociatedTeam.length > 0) {
                                            let atRoleGroup = processATRoles(SitesAssociatedTeam)
                                            obj11 = {
                                                totalCount: SitesAssociatedTeam.length || 0,
                                                atRoleGroup: atRoleGroup.top3,
                                                all: atRoleGroup.all
                                            }
                                        }
                                        subItems["SitesAssociatedTeam"] = obj11

                                        break;
                                    case "URLLink":
                                        let URLLink = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj12: { totalCount: number, } = {
                                            totalCount: 0
                                        }
                                        if (!!URLLink && URLLink.length > 0) {
                                            obj12 = {
                                                totalCount: URLLink.length || 0,
                                            }
                                        }
                                        subItems["URLLink"] = obj12

                                        break;
                                    case "DocumentsLink":
                                        let DocumentsLink = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj13: { totalCount: number, } = {
                                            totalCount: 0
                                        }
                                        if (!!DocumentsLink && DocumentsLink.length > 0) {
                                            obj13 = {
                                                totalCount: DocumentsLink.length || 0,
                                            }
                                        }
                                        subItems["DocumentsLink"] = obj13

                                        break;
                                    case "SiteDocuments":
                                        let SiteDocuments = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj14: { totalCount: number, } = {
                                            totalCount: 0
                                        }
                                        if (!!SiteDocuments && SiteDocuments.length > 0) {
                                            obj14 = {
                                                totalCount: SiteDocuments.length || 0,
                                            }
                                        }
                                        subItems["SiteDocuments"] = obj14

                                        break;
                                    case "HelpDesk":
                                        let HelpDesk = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj15: { totalCount: number, lowCount: number, highCount: number, pendingCount: number, mediumCount: number } = {
                                            totalCount: 0,
                                            lowCount: 0,
                                            highCount: 0,
                                            pendingCount: 0,
                                            mediumCount: 0
                                        }
                                        if (!!HelpDesk && HelpDesk.length > 0) {
                                            let lowCount: number = 0;
                                            let highCount: number = 0;
                                            let pendingCount: number = 0;
                                            let mediumCount: number = 0;
                                            for (let index = 0; index < HelpDesk.length; index++) {
                                                const currentItem = HelpDesk[index]


                                                if (currentItem.QCPriority == "High") {
                                                    highCount++;
                                                }
                                                if (currentItem.QCPriority == "Low") {
                                                    lowCount++;
                                                }
                                                if (currentItem.QCPriority == "Medium") {
                                                    mediumCount++;
                                                }
                                                if (currentItem.HDStatus == "Pending") {
                                                    pendingCount++;
                                                }
                                            }
                                            obj15 = {
                                                totalCount: HelpDesk.length || 0,
                                                lowCount: lowCount || 0,
                                                highCount: highCount || 0,
                                                pendingCount: pendingCount || 0,
                                                mediumCount: mediumCount || 0
                                            }
                                        }
                                        subItems["HelpDesk"] = obj15

                                        break;
                                    case "ClientResponse":
                                        let ClientResponse = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj16: { totalCount: number, } = {
                                            totalCount: 0
                                        }
                                        if (!!ClientResponse && ClientResponse.length > 0) {
                                            obj16 = {
                                                totalCount: ClientResponse.length || 0,
                                            }
                                        }
                                        subItems["ClientResponse"] = obj16

                                        break;
                                    case "AuditInspectionData":
                                        let AuditInspectionData = (!!element.items && element.items.length > 0) ? element.items : ""
                                        let obj17: { totalCount: number, averageScore: any, lowScore: any, highScore: any, OwnerCount: any } = {
                                            totalCount: 0,
                                            averageScore: 0,
                                            lowScore: 0,
                                            highScore: 0,
                                            OwnerCount: 0
                                        }

                                        if (!!AuditInspectionData && AuditInspectionData.length > 0) {
                                            let score = getScoreStatsWithOwners(AuditInspectionData)
                                            obj17 = {
                                                totalCount: AuditInspectionData.length || 0,
                                                averageScore: score.average || 0,
                                                lowScore: score.low || 0,
                                                highScore: score.high || 0,
                                                OwnerCount: score.uniqueOwnerCount || 0

                                            }
                                        }
                                        subItems["AuditInspectionData"] = obj17

                                        break;
                                    default:
                                        break;
                                }

                            }
                            let summeryDetail = {
                                reportDate: moment(new Date()).format("DD/MM/YYYY hh:mm A"),
                                generatedBy: currentUser.displayName
                            }
                            let dateRange = {
                                startDate: state?.filterFromDate || "",
                                endDate: state?.filterToDate || "",
                            }
                            let finalObj = { ...items, ...subItems, summeryDetail: summeryDetail, dateRange };
                            // if (state.filterFromDate && state.filterToDate) {
                            let dateRangeObj = filterDateRange(finalObj, [...allData, ...subListData], state.filterFromDate, state.filterToDate);
                            finalObj = dateRangeObj;
                            // }

                            let jsonData = JSON.stringify(finalObj);

                            if (!!jsonData && state?.selectedDateRangeItem?.value == "Last 30 Days" && !!state.filterFromDate && !!state.filterToDate) {
                                let obj = {
                                    SiteSummeryDetail: jsonData
                                }
                                await provider.updateItem(obj, ListNames.SitesMaster, state.selectedSiteId);
                            }

                            setState((prevState: any) => ({ ...prevState, siteDetailViewItems: finalObj, keyUpdate: Math.random(), isRegenerate: false, isRegenerateCreated: true }));
                        }
                        setState((prevState: any) => ({
                            ...prevState,
                            subListData: subListData,
                            isShowLoader: false,
                            mainListData: allData
                        }));
                    } else {
                        setState((prevState: any) => ({ ...prevState, isLoading: false, isShowLoader: false, }))
                    }


                }


            } catch (error) {
                console.log(error);
                setState((prevState) => ({ ...prevState, isLoading: false }))

            }
        })()

    }, [state.selectedSiteId, state.isRegenerate])

    return {
        state,
        onClickDownload,
        onSiteChange,
        regenerateReport,
        onClickCancel,
        onClickShowEmailModel,
        onChangeTitle,
        onChangeSendToEmail,
        onClickSendEmail,
        onChangeFromDate,
        onChangeToDate,
        onChangeRangeOption,
        onClickApplyFilter,
        onClickConfigureColumn,
        onClickConfigureClose,
        _onChangeConfigurationColumn,
        onClickConfigureColumnSave
    }

} 