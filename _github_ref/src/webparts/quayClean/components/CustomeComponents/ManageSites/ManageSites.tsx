import { Pivot, PivotItem } from "@fluentui/react";
import React from "react"
import { ManageSitesData } from "./ManageSitesData";
import { Loader } from "../../CommonComponents/Loader";
import { ManageUsers } from "./Users/ManageUsers";
import { ManageSitesGroups } from "./Groups/ManageSitesGroups";
import { IQuayCleanState } from "../../QuayClean";
import { ManageSitesLevel } from "./Sites/ManageSitesLevel";

export interface IManageSitesProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    selectedKey?: string;
}


export const ManageSites = (props: IManageSitesProps) => {
    const { _onLinkClickPivot, state } = ManageSitesData(props)


    return <div className="boxCard">
        {state.isLoading && <Loader />}
        <div className="ms-Grid-row ">
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                <h1 className="mainTitle">Manage Sites</h1>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">

                <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={state.selectedKey || ""} onLinkClick={_onLinkClickPivot}>
                    <PivotItem headerText="User" itemKey="User">
                        <ManageUsers manageComponentView={props.manageComponentView} />
                    </PivotItem>
                    <PivotItem headerText="Groups" itemKey="Groups">
                        <ManageSitesGroups manageComponentView={props.manageComponentView} />
                    </PivotItem>
                    <PivotItem headerText="Sites" itemKey="Sites">
                        <ManageSitesLevel manageComponentView={props.manageComponentView} />
                    </PivotItem>
                </Pivot>
            </div>
        </div>
    </div >

}