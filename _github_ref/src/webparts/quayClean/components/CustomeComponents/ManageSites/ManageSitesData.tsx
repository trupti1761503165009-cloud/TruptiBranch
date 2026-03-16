import { PivotItem } from "@fluentui/react"
import React from "react"
import { IManageSitesProps } from "./ManageSites";
export interface IManageSitesState {
    selectedKey: string;
    isLoading: boolean;
}

export const ManageSitesData = (props: IManageSitesProps) => {

    const [state, setState] = React.useState<IManageSitesState>({
        selectedKey: props.selectedKey ? props.selectedKey : "",
        isLoading: false,
    })


    const _onLinkClickPivot = (item: PivotItem) => {
        setState((prevState: any) => ({ ...prevState, selectedKey: item.props.itemKey }))

    }

    return {
        state,
        _onLinkClickPivot,
    }
}