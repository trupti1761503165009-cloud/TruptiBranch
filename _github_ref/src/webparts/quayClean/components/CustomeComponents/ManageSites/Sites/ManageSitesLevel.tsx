import React from "react"
import { ManageSitesLevelData } from "./ManageSitesLevelData"
import { Loader } from "../../../CommonComponents/Loader"
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { MultiStateFilter } from "../../../../../../Common/Filter/MultiStateFilter";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { IQuayCleanState } from "../../../QuayClean";

export interface IManageSitesLevelProps {
    manageComponentView(componentProp: IQuayCleanState): any;
}
interface ISiteRow {
    label: any; site: any; members: any; indent: any;
    expandable: boolean;
    children: any;
    defaultExpanded?: boolean;
    onClickRow?: any;
    item?: any
}



const SiteRow = (props: ISiteRow) => {
    const [expanded, setExpanded] = React.useState(props.defaultExpanded); // default to true if passed

    return (
        <>
            <tr
                // className={`site-row ${props.indent % 2 === 0 ? 'even-row' : 'odd-row'} siteLevel${props.indent}`}
                className={`site-row  siteLevel${props.indent}`}
                onClick={props.expandable ? () => setExpanded(!expanded) : (() => !!props.onClickRow && props.onClickRow(props))}
                data-indent={props.indent}
            >
                <td className={`site-cell ${expanded ? "expanded" : ""}`} style={{ paddingLeft: `${props.indent * 16 + 16}px` }}>
                    {props.expandable && <span >{expanded ? '▼' : '▶'} </span>}
                    {props.label}
                </td>
                <td className="site-cell secondary">{props?.site}</td>
                <td className="site-cell primaryColor">
                    <div className={`${props.members > 0 ? 'countBadge' : ""}`}>{props.members}</div>
                </td>
            </tr>
            {expanded && props.children}
        </>
    );
};

const renderRows = (nodes: any, indent = 0, onClickRow: any) => {
    return nodes.map((node: any, index: any) => (
        <SiteRow
            key={index}
            label={node?.label || node}
            site={node?.site || ""}
            members={node?.members || ""}
            indent={indent}
            expandable={!!node.children}
            defaultExpanded={node.defaultExpanded}
            onClickRow={onClickRow}
            item={!!node.item ? node.item : ""}

        >
            {node.children ? renderRows(node.children, indent + 1, onClickRow) : <NoRecordFound />}
        </SiteRow>
    ));
};

export const ManageSitesLevel = (props: IManageSitesLevelProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const { state, handleSiteChange, onStateChange, onChangeCategory, onClickRow } = ManageSitesLevelData(props)

    return <div>
        <div className="mt-10  manageSiteLevel">
            {state.isLoading && <Loader />}
            <div className="ms-Grid-row  ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  ">
                    <div className="container">
                        <div className="header">
                            <h1 className="">Sites</h1>
                        </div>

                        <div className="search-bar">
                            <div style={{ minWidth: "350px" }}>
                                <MultiStateFilter
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedState={state.selectedStates || []}
                                    onStateChange={onStateChange}
                                    provider={provider}
                                    isRequired={true}
                                    isClearable={true}
                                    placeholder="Select State"
                                />

                            </div>
                            <div style={{ minWidth: "350px", paddingLeft: "17px", }}>
                                <MultipleSiteFilter
                                    key={state.keyUpdate}
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSiteIds={state.selectedSiteIds || []}
                                    onSiteChange={handleSiteChange}
                                    provider={provider}
                                    isRequired={true}
                                    isClearable={true}
                                    selectedState={state.selectedStates || []}
                                />


                            </div>
                            <div style={{ minWidth: "350px", paddingLeft: "17px", }}>
                                <ReactDropdown
                                    options={state.categoryOptions || []}
                                    defaultOption={state.selectedCategory || []}
                                    isMultiSelect={true}
                                    placeholder="Select Category"
                                    onChange={onChangeCategory}
                                />

                            </div>

                        </div>

                        <div className="table-container">
                            <table className="sites-table">
                                <thead>
                                    <tr>
                                        <th className="site-cell">Site name</th>
                                        <th className="site-cell">Label</th>
                                        <th className="site-cell">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                        {state.groupedData.length > 0 ?
                                            renderRows(state.groupedData, 0, onClickRow)

                                            : <NoRecordFound />}
                                    </>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    </div>

}