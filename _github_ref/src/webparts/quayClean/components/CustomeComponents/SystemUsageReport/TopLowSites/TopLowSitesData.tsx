import React from "react"
import { ITopLowSitesProps } from "./TopLowSites";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { TopLowReportCardOption, TopLowReportStateCardOption } from "../../../../../../Common/Constants/CommonConstants";
import { toastService } from "../../../../../../Common/ToastService";
import { ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { generateAndSaveKendoPDFHelpDesk } from "../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
export interface ITopSitesDataState {
    siteViceTopLowItems: any[];
    selectedLoadSiteNumber: number;
    selectedUserReportBy: string;
    stateViceTopLowItems: any[];
    totalStateCount: ITotalCount;
    totalSitesStateCount: ITotalCount;
    filteredCards: any[];
    filteredCardsState: any[];

    keyUpdate: number;
    isGenratePDF: boolean
    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;
    isLoading: boolean;
}


export interface ITotalCount {
    actCount: number;
    nswCount: number
    qldCount: number
    saCount: number;
    tasCount: number;
    vicCount: number;
    waCount: number;

}
export const TopLowSitesData = (props: ITopLowSitesProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, } = appGlobalState;
    const [state, setState] = React.useState<ITopSitesDataState>({
        siteViceTopLowItems: [],
        keyUpdate: Math.random(),
        selectedLoadSiteNumber: 10,
        selectedUserReportBy: props.isStateViewOnly ? "State" : 'Sites',
        stateViceTopLowItems: [],
        filteredCardsState: [],
        filteredCards: [],
        isGenratePDF: !!props.isGenratePdf ? props.isGenratePdf : false,
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isLoading: false,
        isPopupVisible: false,
        totalSitesStateCount: {
            actCount: 0,
            nswCount: 0,
            qldCount: 0,
            saCount: 0,
            tasCount: 0,
            vicCount: 0,
            waCount: 0,
        },
        totalStateCount: {
            actCount: 0,
            nswCount: 0,
            qldCount: 0,
            saCount: 0,
            tasCount: 0,
            vicCount: 0,
            waCount: 0,
        }
    });


    const onClickShowEmailModel = () => {
        setState((prevState) => ({ ...prevState, isPopupVisible: true }))
    }

    const onClickCancel = () => {

        setState((prevState: any) => ({ ...prevState, title: "", sendToEmail: "", displayError: false, displayErrorEmail: false, displayErrorTitle: false, isPopupVisible: false }))
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setState((prevState: any) => ({ ...prevState, title: newValue || "", displayErrorTitle: !!newValue ? false : prevState.displayErrorTitle }))

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
            const fileName = props.excelFileName ? props.excelFileName : (props.isBottomSites ? "Bottom Sites Report" : "Top Sites Report")
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("topLowSites", fileName, false, true, true);
                const el = document.getElementById("topLowSites");
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
                    StateName: "All State",
                    SiteName: "All Site",
                    EmailType: "SystemUsageReport",
                };
                provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                    provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                        console.log("Upload Success");
                    }).catch((err: any) => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onClickCancel();
                    setState((prevState: any) => ({ ...prevState, isGenratePDF: false, isLoading: false }))
                }).catch((err: any) => console.log(err));
                setState((prevState: any) => ({ ...prevState, isGenratePDF: false, isLoading: false }))
            }, 1000);

        } else {
            setState((prevState: any) => ({ ...prevState, isGenratePDF: false, isLoading: false }))
        }
    };

    const onClickDownload = async (): Promise<void> => {
        setState((prevState) => ({ ...prevState, isGenratePDF: true, isLoading: true }))
        setTimeout(async () => {
            const fileName = props.excelFileName ? props.excelFileName : (props.isBottomSites ? "Bottom Sites Report" : "Top Sites Report")
            await generateAndSaveKendoPDFHelpDesk("topLowSites", fileName, false, true, true);
            const el = document.getElementById("topLowSites");
            if (el) {
                el.style.removeProperty("font-family");
            }
            // await generateAndSaveKendoPDF("combineStateReport", "ACT vs BGT vs Roaster Report", false, true);
            setState((prevState) => ({ ...prevState, isGenratePDF: false, isLoading: false, }))
        }, 1000);

    };





    const getSitesCount = (data: any[]) => {
        const siteCount: any = {
            actCount: 0,
            nswCount: 0,
            qldCount: 0,
            saCount: 0,
            tasCount: 0,
            vicCount: 0,
            waCount: 0,
        };

        data.forEach((item) => {
            switch (item.stateName.toUpperCase()) {
                case "ACT":
                    siteCount.actCount += 1;
                    break;
                case "NSW":
                    siteCount.nswCount += 1;
                    break;
                case "QLD":
                    siteCount.qldCount += 1;
                    break;
                case "SA":
                    siteCount.saCount += 1;
                    break;
                case "TAS":
                    siteCount.tasCount += 1;
                    break;
                case "VIC":
                    siteCount.vicCount += 1;
                    break;
                case "WA":
                    siteCount.waCount += 1;
                    break;
            }
        });
        let filteredCards = TopLowReportCardOption.filter((card) => {
            return siteCount[card.columnName] > 0;
        }).map((card) => ({
            ...card,
            cardValue: siteCount[card.columnName], // assign the actual count
        }));
        filteredCards = filteredCards.sort((a, b) => {
            return props.isBottomSites
                ? (a.cardValue as number) - (b.cardValue as number)
                : (b.cardValue as number) - (a.cardValue as number);
        });


        return { siteCount, filteredCards };
    }


    const getStateCount = (data: any[]) => {
        const stateCounts: any = {
            actCount: 0,
            nswCount: 0,
            qldCount: 0,
            saCount: 0,
            tasCount: 0,
            vicCount: 0,
            waCount: 0,
        };

        data.forEach((item) => {
            switch (item.state.toUpperCase()) {
                case "ACT":
                    stateCounts.actCount = item.sitesCount;
                    break;
                case "NSW":
                    stateCounts.nswCount = item.sitesCount;
                    break;
                case "QLD":
                    stateCounts.qldCount = item.sitesCount;
                    break;
                case "SA":
                    stateCounts.saCount = item.sitesCount;
                    break;
                case "TAS":
                    stateCounts.tasCount = item.sitesCount;
                    break;
                case "VIC":
                    stateCounts.vicCount = item.sitesCount;
                    break;
                case "WA":
                    stateCounts.waCount = item.sitesCount;
                    break;
            }
        });

        let filteredCardsState = TopLowReportStateCardOption
            .filter((card) => stateCounts[card.columnName] > 0)
            .map((card) => ({
                ...card,
                cardValue: stateCounts[card.columnName],
            }));

        filteredCardsState = filteredCardsState.sort((a, b) => {
            return props.isBottomSites
                ? (a.cardValue as number) - (b.cardValue as number)
                : (b.cardValue as number) - (a.cardValue as number);
        });

        return { stateCounts, filteredCardsState };
    };


    const generateTheTopLowSites = (
        countNumber: number,
        data: any[],
        isAscending: boolean = false
    ) => {
        data = data.filter((i) => !!i.SiteName);

        const grouped = data.reduce((acc: any, item: any) => {
            const site = item.SiteName || "Unknown Site";
            const entity = item.EntityType || "Unknown Entity";

            if (!acc[site]) {
                acc[site] = {
                    count: 0,
                    items: [],
                    entities: {}  // 🔹 store entity grouping
                };
            }

            // Site-level
            acc[site].count += 1;
            acc[site].items.push(item);

            // Entity-level inside site
            if (!acc[site].entities[entity]) {
                acc[site].entities[entity] = { label: "", count: 0, items: [] };
            }
            acc[site].entities[entity].label = entity;
            acc[site].entities[entity].count += 1;
            acc[site].entities[entity].items.push(item);

            return acc;
        }, {});

        // Convert to array
        let result = Object.entries(grouped).map(([site, value]: [string, any]) => ({
            site,
            count: value.count,
            stateName: value.items[0]?.State || "Unknown State",
            items: value.items,
            isLastLevel: false,
            isExpandable: true,
            children: Object.entries(value.entities).map(([entity, eVal]: [string, any]) => ({
                entity,
                count: eVal.count,
                items: eVal.items,
                children: eVal.items,
                site: eVal.label,
                isLastLevel: true,

            }))
        }));

        // Sort by count
        result = result.sort((a, b) =>
            isAscending ? a.count - b.count : b.count - a.count
        );

        // Return top/bottom N
        return result.slice(0, countNumber);
    };

    const onClickRow = (item?: any) => {
    }



    const generateStateSiteActivities = (
        countNumber: number,
        data: any[],
        isAscending: boolean = false
    ) => {
        data = data.filter((i) => !!i.State && i.State != "Unknown State");
        data = data.filter((i) => !!i.SiteName);

        // Group by State > Site > EntityType
        const groupedByState = data.reduce((acc: any, item: any) => {
            const state = item.State || "Unknown State";
            const site = item.SiteName || "Unknown Site";
            const entity = item.EntityType || "Unknown Entity";

            if (!acc[state]) {
                acc[state] = { sites: {} };
            }

            // Init site inside state
            if (!acc[state].sites[site]) {
                acc[state].sites[site] = { count: 0, items: [], entities: {} };
            }

            // Increment site count & push activity
            acc[state].sites[site].count += 1;
            acc[state].sites[site].items.push(item);

            // Init entity inside site
            if (!acc[state].sites[site].entities[entity]) {
                acc[state].sites[site].entities[entity] = { count: 0, items: [], label: "" };
            }

            // Increment entity count
            acc[state].sites[site].entities[entity].label = entity;
            acc[state].sites[site].entities[entity].count += 1;
            acc[state].sites[site].entities[entity].items.push(item);

            return acc;
        }, {});

        // Convert to array
        let result = Object.entries(groupedByState).map(([state, value]: [string, any]) => {
            let sites = Object.entries(value.sites).map(([site, siteValue]: [string, any]) => {
                // Convert entities inside site
                const entities = Object.entries(siteValue.entities).map(([entity, eVal]: [string, any]) => ({
                    entity,
                    count: eVal.count,
                    state: eVal.label,
                    items: eVal.items,
                    isLastLevel: true
                }));

                return {
                    state: site,
                    stateName: state,
                    count: siteValue.count,
                    // children: siteValue.items,
                    children: entities,
                    items: siteValue.items,       // 🔹 entityType grouping inside site
                    isExpandable: true
                };
            });

            // sort sites by count
            sites = sites.sort((a, b) =>
                isAscending ? a.count - b.count : b.count - a.count
            );

            // slice top/bottom sites
            sites = sites.slice(0, countNumber);

            // ✅ recalc state count from sliced sites only
            const stateCount = sites.reduce((sum, s) => sum + s.count, 0);

            return {
                state,
                count: stateCount,
                sitesCount: sites.length,
                children: sites,
                isExpandable: true
            };
        });

        // ✅ Sort root states by their *visible* count
        result = result.sort((a, b) =>
            isAscending ? a.count - b.count : b.count - a.count
        );

        return result;
    };


    const generateExcelStateSiteActivityReport = (
        fileName: string = "Portal-Usage-State-Site-Activity.xlsx"
    ) => {
        let data = state.stateViceTopLowItems; // expects array of states with children (sites + items)

        const workbook = new ExcelJS.Workbook();

        function styleHeader(row: ExcelJS.Row, bgColor: string, fontColor: string = "FFFFFFFF") {
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                cell.font = { bold: true, color: { argb: fontColor } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });
        }

        function applyFillToRow(row: ExcelJS.Row, color: string, fontColor: string = "FFFFFFFF") {
            row.eachCell((cell) => {
                if (cell.value !== "" && cell.value !== null && cell.value !== undefined) {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
                    cell.font = { ...(cell.font || {}), color: { argb: fontColor }, bold: true };
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                }
            });
        }

        /* ========== SHEET 1: State Summary ========== */
        const sheet1 = workbook.addWorksheet("State Summary");

        const headers1 = ["State", "Total Sites", "Activity Count"];
        const headerRow1 = sheet1.addRow(headers1);
        styleHeader(headerRow1, "1300a6");

        data.forEach((st: any) => {
            sheet1.addRow([st.state, st.sitesCount, st.count]);
        });

        sheet1.addTable({
            name: "StateSummaryTable",
            ref: "A1",
            headerRow: true,
            style: { theme: "TableStyleMedium9", showRowStripes: true },
            columns: headers1.map((h) => ({ name: h, filterButton: true })),
            rows: data.map((st: any) => [st.state, st.sitesCount, st.count]),
        });

        /* ========== SHEET 2: State → Sites → User Activity ========== */
        const sheet2 = workbook.addWorksheet("State-Site-Activity");
        const headers2 = ["State", "Site", "Activity Count ", "", "", "", "", "", ""];
        const headerRow2 = sheet2.addRow(headers2);
        styleHeader(headerRow2, "1300a6");
        data.forEach((st: any) => {
            // L1: State header row
            const stateRow = sheet2.addRow([st.state, ` ${st.sitesCount}`, ` ${st.count}`, "-", "-", "-", "-", "-", "-"]);
            applyFillToRow(stateRow, "0d0553");

            st.children?.forEach((site: any) => {
                // L2: Site header row
                const siteRow = sheet2.addRow(["", ` ${site.state}`, site.stateName, ` ${site.count}`, "-", "-", "-", "-", "-"]);
                applyFillToRow(siteRow, "1300a6");

                // L3: User Activity sub-header
                const activityHeaders = [
                    "",
                    "",
                    "Entity Type",
                    "Entity Name",
                    "Details",
                    "User Name",
                    "Action Type",
                    "Site Name",
                    "Time Stamp",
                ];
                const activityHeaderRow = sheet2.addRow(activityHeaders);
                applyFillToRow(activityHeaderRow, "00d5c9");

                // L3: User Activity rows
                site.items?.forEach((item: any) => {
                    sheet2.addRow([
                        "",
                        "",
                        item.EntityType ?? "-",
                        item.EntityName ?? "-",
                        item.Details ?? "-",
                        item.UserName ?? "-",
                        item.ActionType ?? "-",
                        item.SiteName ?? "-",
                        item.Created ?? "-",
                    ]);
                });

                sheet2.addRow([]); // gap after each site
            });

            sheet2.addRow([]); // gap after each state
        });

        /* ========== Auto-fit all columns ========== */
        let sheet = [sheet1, sheet2]

        sheet.forEach((sheet) => {
            sheet.columns.forEach((col: any) => {
                let maxLength = 10;
                col.eachCell({ includeEmpty: true }, (cell: any) => {
                    if (cell.value != null) {
                        maxLength = Math.max(maxLength, String(cell.value).length);
                    }
                });
                col.width = Math.min(maxLength + 5, 60);
            });
        });
        fileName = props.excelFileName ? `${props.excelFileName}.xlsx` : fileName
        // Export
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, fileName);
        });
    };


    function applyFillToRow(row: ExcelJS.Row, color: string, fontColor?: string) {
        row.eachCell((cell) => {
            if (cell.value !== "" && cell.value !== null && cell.value !== undefined) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
                if (fontColor) {
                    cell.font = { ...(cell.font || {}), color: { argb: fontColor }, bold: true };
                }
            }
        });
    }

    const generateExcelTable = (
        fileName: string = "Portal-Usage-By-Sites.xlsx"
    ) => {
        let data = state.siteViceTopLowItems; // ⬅️ expects same format as UI table

        const workbook = new ExcelJS.Workbook();

        // helper for header styling
        function styleHeader(row: ExcelJS.Row, bgColor: string, fontColor: string = "FFFFFFFF") {
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                cell.font = { bold: true, color: { argb: fontColor } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });
        }

        /* ========== SHEET 1: Sites Report ========== */
        const sheet1 = workbook.addWorksheet("Sites Report");

        const headers1 = ["Sites", "State", "Activity Count"];
        const headerRow1 = sheet1.addRow(headers1);
        styleHeader(headerRow1, "1300a6");

        data.forEach((site: any) => {
            sheet1.addRow([site.site, site.stateName, site.count]);
        });

        // Table styling
        sheet1.addTable({
            name: "SitesTable",
            ref: "A1",
            headerRow: true,
            style: { theme: "TableStyleMedium9", showRowStripes: true },
            columns: headers1.map((h) => ({ name: h, filterButton: true })),
            rows: data.map((s: any) => [s.site, s.stateName, s.count]),
        });

        /* ========== SHEET 2: Site Details ========== */
        const sheet2 = workbook.addWorksheet("Site Details");
        const headerRow2 = sheet2.addRow([...headers1, "-", "-", "-", "-", "-"]);
        styleHeader(headerRow2, "1300a6");
        data.forEach((site: any) => {
            // Site Header
            const siteHeader = sheet2.addRow([site.site, site.stateName, site.count, "-", "-", "-", "-", "-"]);

            applyFillToRow(siteHeader, "0d0553", "FFFFFFFF");


            // Sub-header for activity list
            const detailHeaders = [
                "",
                "Entity Type",
                "Entity Name",
                "Details",
                "User Name",
                "Action Type",
                "Site Name",
                "Time Stamp",
            ];
            const detailHeaderRow = sheet2.addRow(detailHeaders);
            // styleHeader(detailHeaderRow, "00d5c9");
            applyFillToRow(detailHeaderRow, "00d5c9", "FFFFFFFF");

            // Activity rows
            site.items?.forEach((item: any) => {
                sheet2.addRow([
                    "",
                    item.EntityType,
                    item.EntityName,
                    item.Details,
                    item.UserName,
                    item.ActionType,
                    item.SiteName,
                    item.Created,
                ]);
            });

            sheet2.addRow([]); // gap between sites
        });

        /* ========== Auto-fit all columns ========== */
        let sheets = [sheet1]
        if (!props.isDashboardView) {
            sheets.push(sheet2);
        }

        sheets.forEach((sheet) => {
            sheet.columns.forEach((col: any) => {
                let maxLength = 10;
                col.eachCell({ includeEmpty: true }, (cell: any) => {
                    if (cell.value != null) {
                        maxLength = Math.max(maxLength, String(cell.value).length);
                    }
                });
                col.width = Math.min(maxLength + 5, 60);
            });
        });
        fileName = props.excelFileName ? `${props.excelFileName}.xlsx` : fileName
        // Export
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, fileName);
        });
    };

    const onChangeLoadSiteOption = (option: IReactDropOptionProps) => {
        if (!!props.onChangeShowNumber)
            props.onChangeShowNumber(option.value, props.isBottomSites || false)
        setState((prevState: any) => ({ ...prevState, selectedLoadSiteNumber: option.value }));

    }

    const onChangeUserReportBy = (option: IReactDropOptionProps) => {
        setState((prevState: any) => ({ ...prevState, selectedUserReportBy: option.value }));
    }





    React.useEffect(() => {
        try {
            // if (props.userActivityLogItems.length > 0) {
            const siteViceTopLowItems = generateTheTopLowSites(state.selectedLoadSiteNumber, props.userActivityLogItems, props.isBottomSites);
            const stateViceTopLowItems = generateStateSiteActivities(state.selectedLoadSiteNumber, props.userActivityLogItems, props.isBottomSites);
            let { filteredCards, siteCount } = getSitesCount(siteViceTopLowItems);
            let { filteredCardsState, stateCounts } = getStateCount(stateViceTopLowItems);
            // getStateCounts()
            setState((prevState) => ({
                ...prevState,
                // keyUpdate: Math.random(),

                filteredCardsState: filteredCardsState, totalStateCount: stateCounts, siteViceTopLowItems: siteViceTopLowItems, filteredCards: filteredCards, totalSitesStateCount: siteCount, stateViceTopLowItems: stateViceTopLowItems
            }));
            // }

        } catch (error) {
            console.log(error);
        }
    }, [props.userActivityLogItems, state.selectedLoadSiteNumber]);


    React.useEffect(() => {
        setState((prevState: any) => ({ ...prevState, isGenratePDF: props.isGenratePdf }))
    }, [props.isGenratePdf])

    return {
        state,
        onClickRow,
        onChangeLoadSiteOption,
        onChangeUserReportBy,
        generateExcelTable,
        generateExcelStateSiteActivityReport,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onClickShowEmailModel,
        onChangeSendToEmail
    }

}