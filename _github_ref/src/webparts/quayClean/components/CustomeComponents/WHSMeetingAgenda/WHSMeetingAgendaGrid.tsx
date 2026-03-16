import React from "react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, TooltipHost } from "office-ui-fabric-react";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { useId } from "@fluentui/react-hooks";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { WHSMeetingAgendaGridData } from "./WHSMeetingAgendaGridData";
import { PreDateRangeFilterQuaySafe } from "../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import { WHSMeetingCountCard } from "../WHSForms/WHSMeetingCountCard";

export interface IWHSMeetingAgendaGridProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewHelpDesk?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    originalSiteMasterId: any;
    componentProps?: any;
    isReload?: boolean;
    initialValue?: string;
    originalState?: string;
    isNotGeneral?: boolean;
    // view?: any;
    isForm?: boolean;
    isDirectView?: boolean;
    qCStateId?: any;
}
export const WHSMeetingAgendaGrid = (props: IWHSMeetingAgendaGridProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context } = appGlobalState;
    const { state, _onItemInvoked, _onItemSelected, fromDate, toDate, onChangeRangeOption, onChangeFromDate, onChangeToDate, onCloseDialogSucess, onChangeLocationFilter, onClickDeleteIcon, onclickExportToExcel, handleCardClick } = WHSMeetingAgendaGridData(props)
    const tooltipId = useId('tooltip');
    return <div>

        {state.isLoading && <Loader />}
        <div className={props.isDirectView ? "boxCard" : ""}>

            <div className="formgroup eql-height-periodic">
                {props.isDirectView && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <h1 className="mainTitle">WHS Committee Meeting Agenda </h1>
                    </div>
                </div>}

                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <WHSMeetingCountCard data={state.summaryData} handleCardClick={handleCardClick} />
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8 mt-3">
                                <div className="formControl ims-site-pad ptop-5" style={{ marginTop: "15px" }}>
                                    <div className="">
                                        <ReactDropdown
                                            onChange={onChangeLocationFilter}
                                            placeholder="Select Location"
                                            options={state.locationOptions || []}
                                            defaultOption={state.selectedLocation || []}
                                            isMultiSelect={true}
                                            isClearable={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8 mt-3">
                                <div className="formControl ims-site-pad ptop-5" style={{ marginTop: "15px" }}>
                                    <PreDateRangeFilterQuaySafe
                                        fromDate={fromDate}
                                        toDate={toDate}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                        isClearable
                                        IsLast30Record={true}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="formGroup mt-2" id="listingDiv">
                                    <MemoizedDetailList

                                        setContainerDefaultheight={225}
                                        items={state.filterItems || []}
                                        columns={(state.column as any) || []}
                                        manageComponentView={props.manageComponentView}
                                        reRenderComponent={true}
                                        searchable={true}
                                        isAddNew={true}

                                        onItemInvoked={_onItemInvoked}
                                        onSelectedItem={_onItemSelected}
                                        addNewContent={
                                            <>
                                                <div className="dflex">
                                                    <Link className="actionBtn iconSize btnEdit ml-10" disabled={state.items?.length == 0 || state.items == undefined} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                                        text="">
                                                        <TooltipHost
                                                            content={state.items?.length == 0 || state.items == undefined ? "Record not found" : "Export to excel"}
                                                            id={tooltipId}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={"file-excel"}
                                                            />
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                            </>}
                                    />
                                </div>
                            </div>
                        </div>


                    </div>
                </div>


            </div>
        </div>
    </div>

}


