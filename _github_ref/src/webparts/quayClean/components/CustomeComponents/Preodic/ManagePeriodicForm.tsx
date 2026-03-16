import * as React from "react"
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../../QuayClean";
import { Breadcrumb, DatePicker, PrimaryButton, TextField, defaultDatePickerStrings } from "@fluentui/react";
import { ComponentNameEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { removeElementOfBreadCrum } from "../../../../../Common/Util";
export interface IManagePeriodicFormProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: any[];
    loginUserRoleDetails: any;
}

export interface IManagePeriodicFormState {

}

export const ManagePeriodicForm = (props: IManagePeriodicFormProps) => {
    // const [state, SetState] = React.useState<IManagePeriodicFormState>({})
    return <>
        <div className="boxCard">
            <div className="formGroup">
                <h1 className="mainTitle">Periodic Form</h1>
                <div className="boxCard">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.breadCrumItems}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Title" placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Frequency " placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Unit Per Year " placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Month " placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Week " placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Year " placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Area" placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <DatePicker
                                    label="Task Date"
                                    className="formControl"
                                    placeholder="Enter Date"
                                    strings={defaultDatePickerStrings}
                                />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <DatePicker
                                    label="Completion Date"
                                    className="formControl"
                                    placeholder="Enter Date"
                                    strings={defaultDatePickerStrings}
                                />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Job Completion" placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                <TextField className="formControl" label="Cost" placeholder="Enter" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <PrimaryButton
                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                    className="btn btn-primary"
                                    text={'Save'}
                                />
                                <PrimaryButton
                                    style={{ marginBottom: "5px", marginTop: "10px" }}
                                    className="btn btn-danger"
                                    text="Close"
                                    onClick={() => {
                                        const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        props.manageComponentView({ currentComponentName: ComponentNameEnum.ManagePeriodicList, breadCrumItems: breadCrumItems })
                                    }}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    </>

}