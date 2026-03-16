import React, { Children } from "react";
import { ICombineStateReportProps } from "./CombineStateReport";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IReportsCombineState, IReportSites, IReportState, IReportUserActivityLog } from "../IReport";
import { generateAndSaveKendoPDF, generateAndSaveKendoPDFHelpDesk, getUniueRecordsByColumnName } from "../../../../../../Common/Util";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { toastService } from "../../../../../../Common/ToastService";
import { ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";

export interface ICombineStateReportDataState {

    items: IReportsCombineState[];
    totalCount: ITotalCount;
    isCharView: boolean;
    topInteractionCount: number;
    keyUpdate: number;
    isGenratePDF: boolean;
    isLoading: boolean;
    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;


}

interface ITotalCount {
    totalSitesCount: number;
    activeSitesCount: number;
    difference: number;
    activeUserCount: number;
    avgLoginsDay: any;

}

export const CombineStateReportData = (props: ICombineStateReportProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail, context } = appGlobalState;
    const [state, setState] = React.useState<ICombineStateReportDataState>({
        items: [],
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isGenratePDF: props.isGenratePdf || false,
        isLoading: false,
        isPopupVisible: false,
        isCharView: false,
        totalCount: {
            totalSitesCount: 0,
            activeSitesCount: 0,
            difference: 0,
            activeUserCount: 0,
            avgLoginsDay: 0
        },
        topInteractionCount: props.isSubMenu ? 10000 : (!!props.topInteraction ? props.topInteraction : 12),
        keyUpdate: Math.random(),

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
            const fileName: string = 'Combine State Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileName = props.excelFileName ? props.excelFileName : "Combine State Report"
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("combineStateReport", fileName, false, true, true);

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
            const fileName = props.excelFileName ? props.excelFileName : "Combine State Report"
            await generateAndSaveKendoPDFHelpDesk("combineStateReport", fileName, false, true, true);
            const el = document.getElementById("combineStateReport");
            if (el) {
                el.style.removeProperty("font-family");
            }
            // await generateAndSaveKendoPDF("combineStateReport", "ACT vs BGT vs Roaster Report", false, true);
            setState((prevState) => ({ ...prevState, isGenratePDF: false, isLoading: false, }))
        }, 1000);

    };


    const onClickRow = (item?: any) => {
        // props.manageComponentView(({ currentComponentName: ComponentNameEnum.ManageSitesCrud, originalSiteMasterId: item?.item?.Id, isGroupViewPage: false }))
    }

    const onChangeTopInteractionClick = (options: IReactDropOptionProps) => {
        if (props.onClickTopInteraction) {
            props.onClickTopInteraction(options.value);
        }

        setState((prevState: any) => ({ ...prevState, topInteractionCount: options.value }));
    }




    const getDateRange = (startDate: Date, endDate: Date): number => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) return 0;

        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    };

    const countSitesAndAddToStates = (
        sites: IReportSites[],
        states: IReportState[],
        userActivityLogItems: IReportUserActivityLog[],
        count: number
    ) => {
        // 🔹 Precompute total sites per StateId
        let totalDays = getDateRange(props.startDate, props.endDate);
        const stateCount: any = new Map<string, number>();
        for (const site of sites) {
            stateCount.set(site.StateId, (stateCount.get(site.StateId) || 0) + 1);
        }

        // 🔹 Per-state aggregates in one pass
        type EntityStats = {
            count: number;
            entityNames: Map<string, number>;
            items: IReportUserActivityLog[];
        };

        type StateAgg = {
            activeSites: Set<string>;
            activeUsers: Set<string>;
            dailyUsers: Map<string, Set<string>>; // ✅ date → unique users
            entities: Map<string, EntityStats>;
        };

        const stateAgg = new Map<string, StateAgg>();

        for (const log of userActivityLogItems) {
            const state = log.State || "Unknown State";
            if (!stateAgg.has(state)) {
                stateAgg.set(state, {
                    activeSites: new Set(),
                    activeUsers: new Set(),
                    dailyUsers: new Map(),
                    entities: new Map()
                });
            }

            const agg: any = stateAgg.get(state)!;

            // Active sites
            agg.activeSites.add(log.SiteNameId);

            // Active users
            agg.activeUsers.add(log.UserName);

            // Track unique users per day
            const logDate = new Date(log.Created).toDateString();
            if (!agg.dailyUsers.has(logDate)) {
                agg.dailyUsers.set(logDate, new Set());
            }
            agg.dailyUsers.get(logDate)!.add(log.UserName);

            // Entity stats
            if (!agg.entities.has(log.EntityType)) {
                agg.entities.set(log.EntityType, {
                    count: 0,
                    entityNames: new Map(),
                    items: []
                });
            }
            const entity = agg.entities.get(log.EntityType)!;
            entity.count += 1;
            entity.items.push(log);
            entity.entityNames.set(
                log.EntityName,
                (entity.entityNames.get(log.EntityName) || 0) + 1
            );
        }

        // 🔹 Final state mapping
        const updatedStates = states.map((state) => {
            const totalSites = stateCount.get(state.Id) || 0;
            const agg = stateAgg.get(state.Title);

            if (!agg) {
                return {
                    ...state,
                    totalSiteCount: totalSites,
                    activeSiteCount: 0,
                    difference: `${0}%`,
                    activeUsersCount: 0,
                    avgLoginsDay: 0,
                    topEntityTypesCount: [],
                    children: []
                };
            }

            // ✅ Avg logins/day (unique users per day)
            const totalUniqueUsers = Array.from(agg.dailyUsers.values()).reduce(
                (sum, users) => sum + users.size,
                0
            );
            const avgLoginsDay =
                totalDays > 0 ? Number((totalUniqueUsers / totalDays).toFixed(2)) : 0;

            // Top entity types
            const sortedEntities = Array.from(agg.entities.entries())
                .map(([entityType, data]) => ({
                    entityType,
                    count: data.count,
                    entityNames: Array.from(data.entityNames.entries())
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count),
                    items: data.items
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, count);

            return {
                ...state,
                totalSiteCount: totalSites,
                activeSiteCount: agg.activeSites.size,
                difference:
                    `${(totalSites > 0
                        ? Number(
                            ((agg.activeSites.size / totalSites) * 100).toFixed(2)
                        )
                        : 0)}%`,
                activeUsersCount: agg.activeUsers.size,
                avgLoginsDay,
                topEntityTypesCount: sortedEntities.map((e) => ({
                    entityType: e.entityType,
                    count: e.count,
                    childrenSites: e.items
                })),
                isExpandable: sortedEntities?.length > 0,
                children: sortedEntities.map((e) => {
                    // 🔹 Recompute stats only from this entity's items
                    const entityActiveSites = new Set(e.items.map((i) => i.SiteNameId));
                    const entityActiveUsers = new Set(e.items.map((i) => i.UserName));

                    // ✅ Compute daily unique users for entity level
                    const entityDailyUsers = new Map<string, Set<string>>();
                    for (const log of e.items) {
                        const logDate = new Date(log.Created).toDateString();
                        if (!entityDailyUsers.has(logDate)) {
                            entityDailyUsers.set(logDate, new Set());
                        }
                        entityDailyUsers.get(logDate)!.add(log.UserName);
                    }

                    const entityTotalUniqueUsers = Array.from(entityDailyUsers.values()).reduce(
                        (sum, users) => sum + users.size,
                        0
                    );
                    const entityAvgLoginsDay =
                        totalDays > 0
                            ? Number((entityTotalUniqueUsers / totalDays).toFixed(2))
                            : 0;

                    return {
                        entityType: e.entityType,
                        entityNames: e.entityNames,
                        items: e.items,
                        Title: `${e.entityType} (${e.count})`,

                        // 🔹 entity-level stats
                        totalSiteCount: entityActiveSites.size,
                        activeSiteCount: entityActiveSites.size,
                        difference:
                            (`${totalSites > 0
                                ? Number(
                                    (
                                        (entityActiveSites.size / totalSites) *
                                        100
                                    ).toFixed(2)
                                )
                                : 0}%`),
                        activeUsersCount: entityActiveUsers.size,
                        avgLoginsDay: entityAvgLoginsDay,
                        isLastLevel: true,
                        topEntityTypesCount: [],
                        isExpandable: e?.items?.length > 0,
                        children:
                            e.items.length > 0
                                ? e.items.map((i) => ({
                                    Title: i.SiteName,
                                    avgLoginsDay: i.UserName
                                }))
                                : undefined
                    };
                })
            };
        });

        return updatedStates;
    };









    const generateExcelTable = (
        level1Rows: any[],
        fileName: string = "Combined-Portal-Usage-By-State.xlsx"
    ) => {
        const workbook = new ExcelJS.Workbook();

        // helper to apply fill only to non-empty cells
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

        /* ========== SHEET 1: State Report (summary as Excel Table) ========== */
        const sheet1 = workbook.addWorksheet("State Report");

        const headers1 = [
            "State",
            "Total Sites",
            "Sites with Portal Access",
            "% With Access",
            "Active Users",
            "Average Login Day",
            "Top Interactions",
        ];
        sheet1.addRow(headers1);

        level1Rows.forEach((row) => {
            const percentWithAccess =
                row.totalSiteCount > 0
                    ? ((row.activeSiteCount / row.totalSiteCount) * 100).toFixed(2) + "%"
                    : "0%";

            sheet1.addRow([
                row.Title,
                row.totalSiteCount,
                row.activeSiteCount,
                percentWithAccess,
                row.activeUsersCount ?? "-",
                row.avgLoginsDay ?? "-",
                row.topEntityTypesCount?.length
                    ? row.topEntityTypesCount.map((x: any) => `${x.entityType} (${x.count})`).join(", ")
                    : "-",
            ]);
        });

        // Totals
        const totalSites = level1Rows.reduce((s, r) => s + (r.totalSiteCount ?? 0), 0);
        const totalAccess = level1Rows.reduce((s, r) => s + (r.activeSiteCount ?? 0), 0);
        const percentTotal =
            totalSites > 0 ? ((totalAccess / totalSites) * 100).toFixed(2) + "%" : "0%";

        const totalRow = sheet1.addRow(["Total", totalSites, totalAccess, percentTotal, "-", "-", "-"]);
        totalRow.font = { bold: true };

        // Excel Table styling
        sheet1.addTable({
            name: "StateReportTable",
            ref: "A1",
            headerRow: true,
            totalsRow: false,
            style: { theme: "TableStyleMedium9", showRowStripes: true },
            columns: headers1.map((h) => ({ name: h, filterButton: true })),
            rows: sheet1.getRows(2, level1Rows.length)?.map((r: any) => r.values.slice(1)) || [],
        });

        /* ========== SHEET 2: Entity Details ========== */


        // Auto-fit columns
        let sheetArray = [sheet1]
        if (!props.isDashboardView) {
            const sheet2 = workbook.addWorksheet("Entity Details");

            // Root header
            const rootHeaders = [
                "State",
                "Total Sites",
                "Sites with Portal Access",
                "% With Access",
                "Active Users",
                "Average Login Day",
                "Top Interactions",
                "-",
                "-"
            ];
            const rootHeaderRow = sheet2.addRow([...rootHeaders]);
            rootHeaderRow.font = { bold: true };
            rootHeaderRow.alignment = { horizontal: "center" };
            applyFillToRow(rootHeaderRow, "1300a6", "FFFFFFFF");

            // Per-state block
            level1Rows.forEach((state) => {
                const statePct =
                    state.totalSiteCount > 0
                        ? ((state.activeSiteCount / state.totalSiteCount) * 100).toFixed(2) + "%"
                        : "0%";

                // L1 row
                const stateRow = sheet2.addRow([
                    state.Title,
                    state.totalSiteCount,
                    state.activeSiteCount,
                    statePct,
                    state.activeUsersCount ?? "-",
                    state.avgLoginsDay ?? "-",
                    state.topEntityTypesCount?.length
                        ? state.topEntityTypesCount.map((x: any) => `${x.entityType} (${x.count})`).join(", ")
                        : "-",
                    "-",
                    "-"
                ]);
                applyFillToRow(stateRow, "0d0553", "FFFFFFFF");
                stateRow.alignment = { horizontal: "center" }; // ⬅️ center align Level 1 row

                // L2 entity rows
                state.children?.forEach((entity: any) => {
                    const entityPct =
                        entity.difference ??
                        (entity.totalSiteCount > 0
                            ? ((entity.activeSiteCount / entity.totalSiteCount) * 100).toFixed(2) + "%"
                            : "0%");

                    const entityRow = sheet2.addRow([
                        "",
                        `  ${entity.Title}`,
                        entity.totalSiteCount ?? "-",
                        entity.activeSiteCount ?? "-",
                        entityPct,
                        entity.activeUsersCount ?? "-",
                        entity.avgLoginsDay ?? "-",
                        "-",
                        "-",
                    ]);
                    applyFillToRow(entityRow, "D9E1F2");
                    entityRow.alignment = { horizontal: "center" }; // ⬅️ center align Level 2 row

                    // L3 header
                    const l3Headers = [
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
                    const l3HeaderRow = sheet2.addRow(l3Headers);
                    l3HeaderRow.alignment = { horizontal: "center" };
                    applyFillToRow(l3HeaderRow, "00d5c9", "FFFFFFFF");

                    // L3 items
                    entity.items?.forEach((item: any) => {
                        sheet2.addRow([
                            "",
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

                    sheet2.addRow([]);
                });

                sheet2.addRow([]);
            });
            if (!props.isSubMenu)
                sheetArray.push(sheet2)
        }
        sheetArray.forEach((sheet) => {
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



    // Proper Working Method End



    const onClickView = () => {
        setState((prevState: any) => ({ ...prevState, isCharView: !prevState.isCharView }))

    }


    const getCount = (data: any) => {
        const totals = data.reduce(
            (acc: any, item: any) => {
                acc.totalSites += item.totalSiteCount || 0;
                acc.activeStates += item.activeSiteCount || 0;
                acc.activeUsersCount += item.activeUsersCount || 0;
                acc.avgLoginsDay += item.avgLoginsDay || 0;
                return acc;
            },
            { totalSites: 0, activeStates: 0, activeUsersCount: 0, avgLoginsDay: 0 }
        );

        const percentage =
            totals.totalSites > 0
                ? (totals.activeStates / totals.totalSites) * 100
                : 0;

        return {
            totalSitesCount: totals.totalSites || 0,
            activeSitesCount: totals.activeStates || 0,
            activeUserCount: totals.activeUsersCount || 0,
            difference: percentage?.toFixed(2) || 0,
            avgLoginsDay: totals.avgLoginsDay?.toFixed(2) || 0
        };
    }




    React.useEffect(() => {
        try {
            // if (props.stateItems.length) {
            let data = countSitesAndAddToStates(props.siteItems, props.stateItems, props.userActivityLogItems, state.topInteractionCount);
            let totalCount = getCount(data)
            setState((prevState: any) => ({ ...prevState, items: data, totalCount: totalCount, keyUpdate: Math.random() }));
            // }
        } catch (error) {
            console.log(error);

        }
    }, [props.siteItems, props.stateItems, props.userActivityLogItems, state.topInteractionCount,])
    React.useEffect(() => {
        setState((prevState: any) => ({ ...prevState, isGenratePDF: props.isGenratePdf }))
    }, [props.isGenratePdf])

    return {
        state,
        onClickRow,
        generateExcelTable,
        onClickView,
        onChangeTopInteractionClick,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onClickShowEmailModel,
        onChangeSendToEmail
    }

}