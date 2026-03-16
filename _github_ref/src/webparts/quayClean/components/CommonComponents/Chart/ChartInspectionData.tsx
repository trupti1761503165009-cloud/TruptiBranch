/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { Loader } from "../../CommonComponents/Loader";
import moment from "moment";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { TotalInspectionConductedReport } from "./TotalInspectionConductedReport";
import { AverageScoreReport } from "./AverageScoreReport";
import { UniqueOwnerReport } from "./UniqueOwnerReport";
import { InspectionConductedOnCountsReport } from "./InspectionConductedOnCountsReport";
import { InspectionPerformanceScore } from "./InspectionPerformanceScore";
import { Dropdown, IDropdownOption, Label, Link, MessageBar, MessageBarType, PrimaryButton, TooltipHost } from "@fluentui/react";
import { InspectionFilter } from "../../../../../Common/Filter/InspectionFilter";
import { OwnerFilter } from "../../../../../Common/Filter/OwnerFilter";
import { PreDateRangeFilter } from "../../../../../Common/Filter/PreDateRangeFilter";
import NoRecordFound from "../NoRecordFound";
import { LowScoringReport } from "./LowScoringReport";
import { OwnerDatewithTotalCountReport } from "./OwnerDatewithTotalCountReport";
import { OwnerDateWithScoreReport } from "./OwnerDatewithScoreReport";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { getCAMLQueryFilterExpression } from "../../../../../Common/Util";
import { ReportTemplateFilter } from "../../../../../Common/Filter/ReportTemplateFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InspectionLastEditedBy } from "../../../../../Common/Filter/InspectionLastEditedBy";

const dropdownOptions: IDropdownOption[] = [
    { key: 'selectAll', text: 'Select All' },
    { key: 'Total Inspections Conducted', text: 'Total Inspections Conducted' },
    { key: 'Average Score', text: 'Average Score' },
    { key: 'Unique People Conducting Inspections (Owner)', text: 'Unique People Conducting Inspections (Owner)' },
    { key: 'Inspection Conducted on Counts', text: 'Inspection Conducted on Counts' },
    { key: 'Inspection Performance by Score by Date', text: 'Inspection Performance by Score by Date' },
    { key: 'Low Scoring Inspections', text: 'Low Scoring Inspections' }
];

export interface IAssociateChemicalProps {
    siteName: any;
    tab: any;
}

export const SafetyCultureReport = (props: IAssociateChemicalProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [selectedTemplateName, setSelectedTemplateName] = React.useState<any[]>([]);
    const [selectedOwner, setSelectedOwner] = React.useState<any>("");
    const [selectedInspection, setSelectedInspection] = React.useState<any>("Conducted Date");
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [InspectionData, setInspectionData] = React.useState<any>();
    // const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: '', text: 'select' });
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: "Last 30 Days", text: "Last 30 Days" });
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [permissionData, setPermissionData] = React.useState<any>();
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
    const [resetFilter, setResetFilter] = React.useState(false);
    const [resetTempFilter, setResetTempFilter] = React.useState(false);
    const [resetOwnerFilter, setResetOwnerFilter] = React.useState(false);
    const [resetInsFilter, setResetInsFilter] = React.useState(false);
    const [resetDateFilter, setResetDateFilter] = React.useState(false);
    const [resetLastEditedByFilter, setResetLastEditedByFilter] = React.useState(false);
    const [showSaveMessageBar, setSaveShowMessageBar] = React.useState<boolean>(false);
    const [showUpdateMessageBar, setUpdateShowMessageBar] = React.useState<boolean>(false);
    const [selectedLastEditedBy, setSelectedLastEditedBy] = React.useState<any>("");

    const handleDropdownChange = (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ) => {
        if (!option) return;
        setSelectedOptions((prevSelections) => {
            let updatedSelections: string[];
            if (option.key === 'selectAll') {
                // Toggle "Select All"
                if (prevSelections.length === dropdownOptions.length - 1) {
                    updatedSelections = []; // Deselect all
                } else {
                    updatedSelections = dropdownOptions
                        .filter((opt) => opt.key !== 'selectAll')
                        .map((opt) => opt.key.toString());
                }
            } else {
                // Handle individual selection
                if (option.selected) {
                    updatedSelections = [...prevSelections, option.key.toString()];
                } else {
                    updatedSelections = prevSelections.filter((key) => key !== option.key.toString());
                }
            }
            return updatedSelections;
        });
    };

    React.useEffect(() => {
        if (permissionData && permissionData.length > 0) {
            permissionData?.forEach((permission: any) => {
                if (permission.UserId === currentUserRoleDetail.Id) {
                    setSelectedOptions(permission.Permission);
                }
            });
        } else {
            const allTexts = dropdownOptions
                .filter(option => option.key !== 'selectAll') // Exclude the 'Select All' option
                .map(option => option.text); // Extract the 'text' values
            setSelectedOptions(allTexts); // Set the state
        }
    }, [permissionData]);

    const onClickSave = async () => {
        setIsLoading(true);
        const PermissionDataObj = {
            UserId: Number(currentUserRoleDetail.Id),
            Permission: selectedOptions || [],
        };

        const matchingRecord = !!permissionData && permissionData.length > 0 && permissionData.find(
            (record: any) => record.UserId === PermissionDataObj.UserId
        );

        if (matchingRecord) {
            setUpdateShowMessageBar(true);
            await provider.updateItemWithPnP(PermissionDataObj, ListNames.ReportPermission, matchingRecord.ID);
            onClickAddAccess();
            setIsLoading(false);
            setTimeout(() => {
                setUpdateShowMessageBar(false);
            }, 4000);
        } else {
            setSaveShowMessageBar(true);
            await provider.createItem(PermissionDataObj, ListNames.ReportPermission).then(async (item: any) => {
                onClickAddAccess();
                setIsLoading(false);
                setTimeout(() => {
                    setSaveShowMessageBar(false);
                }, 4000);
            });
        }
    };

    const onTemplateNameChange = (TemplateNames: any[]): void => {
        setSelectedTemplateName(TemplateNames.map(template => template.text));
    };
    const onOwnerChange = (Owner: any): void => {
        setSelectedOwner(Owner.text);
    };
    const onInspectionChange = (Inspection: any): void => {
        setSelectedInspection(Inspection);
    };
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
    const onLastEditedByChange = (LastEditedByName: any): void => {
        setSelectedLastEditedBy(LastEditedByName.text);
    };
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: (string | null)[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        const updatedSiteSC = siteSC.map((sc, index) => sc ?? siteTitles[index] ?? "Default SC");
        setSelectedSCSites(updatedSiteSC);
    };

    const onClickAddAccess = () => {
        setIsLoading(true);
        try {
            const select = ["ID,UserId,User/Title,User/EMail,Permission"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["User"],
                listName: ListNames.ReportPermission,
                filter: `UserId eq '${currentUserRoleDetail.Id}'`
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const PermissionData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                UserId: !!data.UserId ? data.UserId : '',
                                Permission: !!data.Permission ? data.Permission : '',
                                User: !!data.User ? data.User.Title : '',
                                UserEmail: !!data.User ? data.User.EMail : ''
                            }
                        );
                    });
                    setPermissionData(PermissionData);
                    setIsLoading(false);
                }

            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    }

    const _Data = async (DirectSCSiteId?: any, isReset?: boolean) => {
        setIsLoading(true);
        try {
            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: "Archived",
                    fieldValue: false,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                }
            ];
            const filterFieldsSite: ICamlQueryFilter[] = [];

            if (filterFromDate && filterToDate && selectedInspection && isReset === false) {
                const dateField = selectedInspection === "Conducted Date" ? "Conductedon" : "Completed";
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${filterFromDate}T00:00:00Z`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${filterToDate}T23:59:59Z`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })

            } else {
                const endDate = moment().format('YYYY-MM-DD'); // Today's date
                const startDate = moment().subtract(29, 'days').format('YYYY-MM-DD'); // 30 days ago
                const dateField = selectedInspection === "Conducted Date" ? "Conductedon" : "Completed";

                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${startDate}T00:00:00Z`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${endDate}T23:59:59Z`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            }

            // Site Filter
            let finalSCSite = DirectSCSiteId || null;
            if ((props.siteName || finalSCSite || selectedSiteIds.length > 0) && isReset === false) {
                filterFieldsSite.push({
                    fieldName: `SiteName`,
                    fieldValue: selectedSiteIds.length > 0 ? selectedSiteIds : [props.siteName],
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                })
                filterFieldsSite.push({
                    fieldName: `SCSiteId`,
                    fieldValue: selectedSiteIds.length > 0 ? selectedSCSites : [finalSCSite || "Not Found"],
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                })
            }

            // Additional Filters            
            if (selectedTemplateName.length > 0 && isReset === false) {
                filterFields.push({
                    fieldName: `TemplateName`,
                    fieldValue: selectedTemplateName,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                })
            }
            if (selectedOwner && isReset === false) {
                filterFields.push({
                    fieldName: `Owner`,
                    fieldValue: `${selectedOwner}`,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }
            if (selectedLastEditedBy && isReset === false) {
                filterFields.push({
                    fieldName: `LastEditedBy`,
                    fieldValue: `${selectedLastEditedBy}`,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }
            const camlQuery = new CamlBuilder()
                .View([
                    "ID",
                    "Title",
                    "Conductedon",
                    "Completed",
                    "SiteName",
                    "TemplateName",
                    "Owner",
                    "Archived",
                    "DocNumber",
                    "Score",
                    "Created",
                    "Modified",
                    "InspectionTitle",
                    "TemplateId",
                    "WebReportURL",
                    "Status",
                    "Location",
                    "ItemsCompleted"
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();

            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            const siteFilter: any[] = getCAMLQueryFilterExpression(filterFieldsSite);
            camlQuery.Where().All(categoriesExpressions);
            camlQuery.OrderByDesc(selectedInspection === "Conducted Date" ? "Conductedon" : "Completed");

            let finalQuery = camlQuery.ToString();
            if (filterFieldsSite.length > 0) {
                finalQuery = CamlBuilder.FromXml(camlQuery.ToString())
                    .ModifyWhere().AppendAnd().Any(siteFilter).ToString();
            }

            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.AuditInspectionData,
                queryXML: finalQuery,
                pageToken: "",
                pageLength: 100000
            }
            const localResponse = await provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            const results = localResponse?.Row;
            if (!!results) {
                const ListData = results?.filter((data: any) => Number(data.Score) !== 0).map((data: any) => {
                    return {
                        ID: data.ID,
                        Title: data.Title,
                        SiteNameId: !!data.SiteName ? data.SiteName[0]?.lookupId : '',
                        SCSiteId: !!data.SCSiteId ? data.SCSiteId : '',
                        Score: !!data.Score ? Number(data.Score) : 0,
                        Owner: !!data.Owner ? data.Owner : '',
                        Conductedon: !!data.Conductedon ? moment(data.Conductedon).format('DD MMM YYYY') : '',
                        FormatConductedon: !!data.Conductedon ? moment(data.Conductedon).format('YYYY-MM-DD') : '',
                        OrgConductedon: !!data.Conductedon ? data.Conductedon : '',
                        Created: !!data.Created ? moment(data.Created).format('DD MMM YYYY HH:MM A') : '',
                        Duration: !!data.Duration ? Number(data.Duration) : 0,
                        InspectionTitle: !!data.InspectionTitle ? data.InspectionTitle : '',
                        ItemsCompleted: !!data.ItemsCompleted ? data.ItemsCompleted : '',
                    };
                });
                setInspectionData(ListData);
                setIsLoading(false);
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    const onClickLoadData = (isReset: boolean) => {
        if (props.siteName) {
            try {
                const select = ["ID,Title,SCSiteId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `ID eq ${props.siteName}`,
                    listName: ListNames.SitesMaster,
                };
                provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        const SiteData: any = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    SCSiteId: !!data.SCSiteId ? data.SCSiteId : "",
                                }
                            );
                        });
                        _Data(SiteData[0].SCSiteId, isReset);

                    }
                }).catch((error: any) => {
                    console.log(error);
                    setIsLoading(false);
                });
            } catch (ex) {
                console.log(ex);
            }
        } else {
            _Data(null, isReset);
        }
    };

    const OnClickSearch = () => {
        setIsRefreshGrid(false);
        onClickLoadData(false);
    };

    const OnClickReset = async () => {
        setResetFilter(true);
        setTimeout(() => setResetFilter(false), 0);
        setResetTempFilter(true);
        setTimeout(() => setResetTempFilter(false), 0);
        setResetOwnerFilter(true);
        setTimeout(() => setResetOwnerFilter(false), 0);
        setResetInsFilter(true);
        setTimeout(() => setResetInsFilter(false), 0);
        setResetDateFilter(true);
        setTimeout(() => setResetDateFilter(false), 0);
        setResetLastEditedByFilter(true);
        setTimeout(() => setResetLastEditedByFilter(false), 0);
        setIsRefreshGrid(false);
        setSelectedSCSites([]);
        setSelectedSiteTitles([]);
        setSelectedSiteIds([]);
        setSelectedTemplateName([]);
        setSelectedOwner("");
        setSelectedInspection("Conducted Date");
        setSelectedItem({ key: "Last 30 Days", text: "Last 30 Days" });
        setFilterFromDate(undefined);
        setFilterToDate(undefined);
        onClickLoadData(false);
    };

    React.useEffect(() => {
        onClickLoadData(false);
    }, []);

    React.useEffect(() => {
        onClickAddAccess();
    }, [currentUserRoleDetail]);

    React.useEffect(() => {
        setIsRefreshGrid(true);
    }, [InspectionData]);

    return <>
        {isLoading && <Loader />}
        <div >
            <div className="displayflexOnly">
                <div className="left-list-width">
                    {!props.siteName && <div className="formControl">
                        <MultipleSiteFilter
                            isPermissionFiter={true}
                            loginUserRoleDetails={currentUserRoleDetail}
                            selectedSiteIds={selectedSiteIds}
                            selectedSiteTitles={selectedSiteTitles}
                            selectedSCSite={selectedSCSites}
                            onSiteChange={handleSiteChange}
                            provider={provider}
                            isRequired={true}
                            reset={resetFilter} // Pass the reset state
                            AllOption={true} />
                    </div>}
                    <div className="formControl">
                        <ReportTemplateFilter
                            selectedTemplateName={selectedTemplateName}
                            onTemplateNameChange={onTemplateNameChange}
                            provider={provider}
                            siteNameId={props.siteName || 0}
                            reset={resetTempFilter}
                            AllOption={true} />
                    </div>
                    <div className="formControl">
                        <OwnerFilter
                            selectedOwner={selectedOwner}
                            onOwnerChange={onOwnerChange}
                            provider={provider}
                            siteNameId={props.siteName || 0}
                            reset={resetOwnerFilter}
                            AllOption={true} />
                    </div>
                    <div className="formControl">
                        <InspectionLastEditedBy
                            selectedLastEditedBy={selectedLastEditedBy}
                            onLastEditedByChange={onLastEditedByChange}
                            provider={provider}
                            siteNameId={props.siteName || 0}
                            AllOption={true}
                            reset={resetLastEditedByFilter} />
                    </div>
                    <div className="formControl">
                        <InspectionFilter
                            selectedInspection={selectedInspection}
                            onInspectionChange={onInspectionChange}
                            defaultOption="Conducted Date"
                            provider={provider}
                            reset={resetInsFilter}
                            AllOption={true} />
                    </div>
                    <div className="formControl">
                        <PreDateRangeFilter
                            defaultSelected={selectedItem}
                            fromDate={fromDate}
                            toDate={toDate}
                            onFromDateChange={onChangeFromDate}
                            onToDateChange={onChangeToDate}
                            onChangeRangeOption={onChangeRangeOption}
                            reset={resetDateFilter}
                        />
                    </div>

                    <div className="formControl dflex">
                        <PrimaryButton className="btn btn-primary" onClick={() => OnClickSearch()} text="Search" />
                        <PrimaryButton className="btn btn-danger ml-10 red-btn-max-width" onClick={() => OnClickReset()} text="Reset" />
                    </div>
                    {props.tab === "Overview" &&
                        <> <hr></hr>
                            <div className="formControl mt-3">
                                <Label className="chart-label">
                                    Inspection Chart View Filter
                                </Label>
                                {showSaveMessageBar &&
                                    <MessageBar messageBarType={MessageBarType.success}>
                                        <div className="inputText">Chart view has been saved successfully!</div>
                                    </MessageBar>}
                                {showUpdateMessageBar &&
                                    <MessageBar messageBarType={MessageBarType.success}>
                                        <div className="inputText">Chart view has been updated successfully!</div>
                                    </MessageBar>}
                                <div className="dflex">
                                    <div className="report-dd-max-w">
                                        <Dropdown
                                            className="mt-1"
                                            placeholder="Select chart"
                                            multiSelect
                                            options={dropdownOptions}
                                            selectedKeys={selectedOptions}
                                            onChange={handleDropdownChange}
                                        />
                                    </div>
                                    <div className="report-dd-ml-1">
                                        <Link
                                            className="actionBtn iconSize btnGreen dticon mt-1"
                                            onClick={() => onClickSave()}
                                        >
                                            <TooltipHost content={"Give Permission"}>
                                                <FontAwesomeIcon icon="save" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </>}
                </div>
                <div className="center-content-width ms-ScrollablePane--contentContainer" >
                    {isRefreshGrid && !!InspectionData && InspectionData.length > 0 && props.tab === "Overview" &&
                        <div>
                            <div className="ms-Grid-row mb-2 chart-card-ml12">
                                {!!selectedOptions.includes("Total Inspections Conducted") && <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                                    <TotalInspectionConductedReport ChartData={InspectionData} />
                                </div>}
                                {!!selectedOptions.includes("Average Score") && <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                                    <AverageScoreReport ChartData={InspectionData} />
                                </div>}
                                {!!selectedOptions.includes("Unique People Conducting Inspections (Owner)") && <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                                    <UniqueOwnerReport ChartData={InspectionData} />
                                </div>}
                            </div>

                            {!!selectedOptions.includes("Inspection Conducted on Counts") && <div className="ms-Grid-row mt-2 mb-3 chart-card-ml12">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                    <InspectionConductedOnCountsReport ChartData={InspectionData} />
                                </div>
                            </div>}

                            {!!selectedOptions.includes("Inspection Performance by Score by Date") && <div className="ms-Grid-row mt-2 mb-3 chart-card-ml12">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                    <InspectionPerformanceScore ChartData={InspectionData} />
                                </div>
                            </div>}

                            {!!selectedOptions.includes("Low Scoring Inspections") && <div className="ms-Grid-row mt-1  mb-3 chart-card-ml12">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                    <LowScoringReport ChartData={InspectionData} />
                                </div>
                            </div>}
                        </div>
                    }

                    {isRefreshGrid && !!InspectionData && InspectionData.length > 0 && props.tab === "Conducted" &&
                        <div>
                            <div className="ms-Grid-row chart-card-ml0">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                    <OwnerDatewithTotalCountReport ChartData={InspectionData} />
                                </div>
                            </div>
                        </div>
                    }

                    {isRefreshGrid && !!InspectionData && InspectionData.length > 0 && props.tab === "Performance" &&
                        <div>
                            <div className="ms-Grid-row chart-card-ml0">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                    <OwnerDateWithScoreReport ChartData={InspectionData} />
                                </div>
                            </div>
                        </div>
                    }

                    {InspectionData?.length === 0 &&
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 chart-nf-pad">
                                <NoRecordFound />
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div >
    </>;
};