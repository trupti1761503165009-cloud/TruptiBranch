import React from "react"
import { faSortUp, faSortDown, faAngleRight, faAngleLeft, } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ITooltipHostStyles, TooltipHost } from "@fluentui/react";

import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { MultiStateFilter } from "../../../../../Common/Filter/MultiStateFilter";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import { EntityTypeFilter } from "../../../../../Common/Filter/EntityType";
import { ActionTypeFilter } from "../../../../../Common/Filter/ActionType";
import { ActivityLogUserFilter } from "../../../../../Common/Filter/ActivityLogUserName";
import { PreDateRangeFilterInspection } from "../../../../../Common/Filter/PreDateRangeFilterInspection";
import { useAtomValue } from "jotai";

import { Loader } from "../../CommonComponents/Loader";
import { SystemUsageReportData } from "./SystemUsageReportData";
import { useId } from "@fluentui/react-hooks";
import { LoadCombineStateReportEnum } from "../../../../../Common/Constants/CommonConstants";
export interface ISystemUsageReportProps {
    loginUserRoleDetails: any;
}
const calloutProps = { gapSpace: 0 };
// The TooltipHost root uses display: inline by default.
// If that's causing sizing issues or tooltip positioning issues, try overriding to inline-block.
const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };

export const SystemUsageReport = (props: ISystemUsageReportProps) => {
    const { isCollapsed, state, toggleSidebar, openSubmenus, menuItems, onClickLeftNavigation, onClickSubMenu, onActionTypeChange, toggleSubmenu, onRenderComponent, onStateChange, onEntityTypeChange, handleSiteChange, onUserActivityLogChange, onChangeFromDate, onChangeRangeOption, onChangeToDate } = SystemUsageReportData(props)
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const tooltipId = useId('tooltip');
    const { provider, currentUserRoleDetail, context } = appGlobalState;

    const getDisplayName = () => {
        const { selectedMenu, bottomNumber, topNumber } = state;

        if (selectedMenu.key === LoadCombineStateReportEnum.BottomTenSite) {
            return selectedMenu.DisplayName.replace("10", bottomNumber.toString());
        }

        if (selectedMenu.key === LoadCombineStateReportEnum.TopTenSite) {
            return selectedMenu.DisplayName.replace("10", topNumber.toString());
        }

        return selectedMenu?.DisplayName || "";
    };
    return <div className="combineStateReport">
        {state.isLoading && <Loader />}
        <div style={{ display: 'flex' }} key={state.toggleKeyUpdate} >
            {/* Left Navigation  Start*/}
            <div id="sidebarSys" className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} >
                <div className="">
                    <div className="toggle-btn" onClick={toggleSidebar}> <FontAwesomeIcon icon={!isCollapsed ? faAngleLeft : faAngleRight} className="iconReport" /></div>
                    <ul>
                        {menuItems.map((item, index) => (
                            <li
                                key={index}
                                className={item.submenu ? `has-submenu ${openSubmenus[item.submenuKey!] ? 'open' : ''}` : ''}
                            >
                                {item.submenu ? (
                                    <>
                                        <div className="submenu-toggle dflex justifyContentBetween cursorPointer" onClick={() => toggleSubmenu(item.submenuKey!)}>
                                            <a
                                                className={item.key == state.selectedMenu.key ? "active" : ""}

                                                // onClick={() => toggleSubmenu(item.submenuKey!)}
                                                data-tooltip={item.tooltip}
                                            >
                                                <FontAwesomeIcon icon={item.icon} className="iconReport" />
                                                <span>{item.label}</span>


                                            </a>
                                            <FontAwesomeIcon icon={openSubmenus[item.submenuKey!] ? faSortUp : faSortDown} className="iconReport" />
                                        </div>

                                        <ul className="submenu">
                                            {item.submenu.map((sub, subIndex) => (
                                                <li key={subIndex}>
                                                    <TooltipHost content={sub.tooltip}
                                                        id={tooltipId}
                                                        calloutProps={calloutProps}
                                                        styles={hostStyles}
                                                    >

                                                        <a
                                                            onClick={() => onClickSubMenu(sub, item)}
                                                            className={sub.key == state.selectedMenu.key ? "active" : ""}
                                                        >
                                                            <FontAwesomeIcon icon={sub.icon} className="iconReport" />
                                                            <span>{sub.label}</span></a>
                                                    </TooltipHost>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <TooltipHost content={item.tooltip}
                                        id={tooltipId}
                                        calloutProps={calloutProps}
                                        styles={hostStyles}
                                    >
                                        <a onClick={() => onClickLeftNavigation(item.key, item.tooltip)}
                                            className={item.key == state.selectedMenu.key ? "active" : ""}

                                        >
                                            <FontAwesomeIcon icon={item.icon} className="iconReport" />
                                            <span>{item.label}</span>

                                        </a>
                                    </TooltipHost>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Left Navigation  End*/}
            <div className="boxCard flexCard">
                <div className="">
                    <div className="ms-Grid-row ">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                            <h1 className="mainTitle">{
                                getDisplayName()
                            }


                            </h1>
                            {/* <h1 className="mainTitle">{
                                state.selectedMenu.DisplayName}
                            </h1> */}
                        </div>
                        <div className="sysUsage-card droot" >
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <MultiStateFilter
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedState={state.selectedStatesId || []}
                                        onStateChange={onStateChange}
                                        provider={provider}
                                        isRequired={false}
                                        isClearable={true}
                                    // key={state.allFilterKeyUpdate}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <MultipleSiteFilter
                                        key={state.stateKeyUpdate}
                                        isClearable={true}
                                        isPermissionFiter={true}
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedSiteIds={state.selectedSiteIds || []}
                                        selectedSiteTitles={state.selectedSiteTitles || []}
                                        selectedSCSite={state.selectedSCSites || []}
                                        selectedState={state.selectedStatesId || []}
                                        onSiteChange={handleSiteChange}
                                        provider={provider}
                                        AllOption={false}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <EntityTypeFilter
                                        // key={state.allFilterKeyUpdate}
                                        isMultipleSelect={true}
                                        isClearable={true}
                                        selectedEntityType={state.selectedEntityType || []}
                                        defaultOption={!!state.selectedEntityType ? state.selectedEntityType : []}
                                        onEntityTypeChange={onEntityTypeChange}
                                        provider={provider}
                                        AllOption={false}
                                        isCloseMenuOnSelect={false}
                                        isRequired={true} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <ActionTypeFilter
                                        // key={state.allFilterKeyUpdate}
                                        isMultipleSelect={true}
                                        isClearable={true}
                                        selectedActionType={state.selectedActionType || []}
                                        defaultOption={!!state.selectedActionType ? state.selectedActionType : []}
                                        onActionTypeChange={onActionTypeChange}
                                        provider={provider}
                                        isCloseMenuOnSelect={false}
                                        AllOption={false}
                                        isRequired={true} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <ActivityLogUserFilter
                                        isCloseMenuOnSelect={false}
                                        key={state.stateKeyUpdate}
                                        isClearable={true}
                                        isMultipleSelect={true}
                                        selectedActivityLogUser={state.selectedActivityLogUser || ""}
                                        defaultOption={!!state.selectedActivityLogUser ? state.selectedActivityLogUser : ""}
                                        onOptionChange={onUserActivityLogChange}
                                        provider={provider}
                                        AllOption={false} />

                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <PreDateRangeFilterInspection
                                        fromDate={state.fromDate}
                                        toDate={state.toDate}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                            <div key={state.keyUpdate}>
                                {onRenderComponent()}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>



    </div>

}