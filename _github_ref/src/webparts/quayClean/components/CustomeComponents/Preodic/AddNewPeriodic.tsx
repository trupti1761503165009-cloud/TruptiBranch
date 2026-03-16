/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, DatePicker, DefaultButton, Dialog, DialogFooter, DialogType, FocusTrapZone, Label, Layer, Overlay, Popup, PrimaryButton, TextField, Toggle, defaultDatePickerStrings, mergeStyleSets } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { logGenerator, onFormatDate, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { useBoolean } from "@fluentui/react-hooks";
import { Loader } from "../../CommonComponents/Loader";
import { MonthFilter } from "../../../../../Common/Filter/MonthFilter";
import { WeekFilter } from "../../../../../Common/Filter/WeekFilter";
import { FrequencyFilter } from "../../../../../Common/Filter/FrequencyFilter";
import { JobCompletionFilter } from "../../../../../Common/Filter/JobCompletionFilter";
import { YearFilter } from "../../../../../Common/Filter/YearFilter";
import { QCAreaFilter } from "../../../../../Common/Filter/QCAreaFilter";
import { toastService } from "../../../../../Common/ToastService";
import CustomModal from "../../CommonComponents/CustomModal";
import { PeriodicCommonFilter } from "../../../../../Common/Filter/PeriodicCommonFilter";
import { WorkTypeFilter } from "../../../../../Common/Filter/WorkTypeFilter";
import moment from "moment";
export interface IAddNewPeriodicProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewAsset?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    isShowDetailOnly?: boolean;
    dataObj?: any;
    dataObj2?: any;
    componentProp: IQuayCleanState;
    loginUserRoleDetails: any;
    siteMasterId: any;
}


export const AddNewPeriodic = (props: IAddNewPeriodicProps) => {
    const [selectedFrequency, setSelectedFrequency] = React.useState<any>("");
    const [selectedJobCompletion, setSelectedJobCompletion] = React.useState<any>("");
    const [selectedWeek, setSelectedWeek] = React.useState<any>("");
    const [selectedMonth, setSelectedMonth] = React.useState<any>("");
    const [selectedYear, setSelectedYear] = React.useState<any>("");
    const [selectedWorkType, setSelectedWorkType] = React.useState<any>("");
    const [selectedQCArea, setSelectedQCArea] = React.useState<any>("");
    const [selectedSubLocation, setSelectedSubLocation] = React.useState<any>("");
    const [TaskDate, setTaskDate] = React.useState<Date | undefined>(undefined);
    const [CompletionDate, setCompletionDate] = React.useState<Date | undefined>(undefined);
    const [validationMessages, setValidationMessages] = React.useState<any[]>([]);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
    const [isNotification, setIsNotification] = React.useState<boolean>(false);
    const [, setIsDeleted] = React.useState<boolean>(true);
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [addPeriodicDataList, setaddPeriodicDataList] = React.useState<any>({
        Title: "",
        Cost: "",
        EventNumber: "",
        Hours: 0,
        StaffNumber: "",
        // SubLocation: ""
    });
    const [width, setWidth] = React.useState<string>("400px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("400px");
        }
    }, [window.innerWidth]);

    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const onFrequencyChange = (FrequencyId: string): void => {
        setSelectedFrequency(FrequencyId);
    };
    const onJobCompletionChange = (JobCompletionId: string): void => {
        setSelectedJobCompletion(JobCompletionId);
    };
    const onWeekChange = (Week: any): void => {
        setSelectedWeek(Week.text);
    };
    const onMonthChange = (Month: any): void => {
        setSelectedMonth(Month.text);
    };
    const onYearChange = (Year: any): void => {
        setSelectedYear(Year.text);
    };
    const onWorkTypeChange = (WorkType: any): void => {
        setSelectedWorkType(WorkType);
    };
    const onQCAreaChange = (QCArea: any): void => {
        setSelectedQCArea(QCArea);
    };
    const onSubLocationChange = (SubLocation: any): void => {
        setSelectedSubLocation(SubLocation);
    };
    const addPeriodicData = (event: any) => {
        setaddPeriodicDataList({ ...addPeriodicDataList, [event.target.name]: event.target.value });
        if (event.target.name == "Hours") {
            if (event.target.value == "" || event.target.value == undefined) {
                setdisplayerror(false);
            }
            const enteredValue = event.target.value;
            const urlPattern = /^-?\d*\.?\d*$/;
            if (!enteredValue || urlPattern.test(enteredValue)) {
                setdisplayerror(false);
            } else {
                setdisplayerror(true);
            }
        }
    };

    const dialogContentProps = {
        type: DialogType.normal,
        title: 'Validation Summary',
        closeButtonAriaLabel: 'Close'
    };
    const modalPropsStyles = { main: { maxWidth: 450 } };
    const modalProps = React.useMemo(
        () => ({
            isBlocking: true,
            styles: modalPropsStyles,
        }),
        [],
    );
    const validateForm = () => {
        const { Title, Cost } = addPeriodicDataList;
        setValidationMessages([]);
        let messages = [];
        if (!Title) {
            messages.push("Periodic Title Is Required");
        }
        if (!!Cost && !(/^\d*[.]?\d*$/).test(Cost)) {
            messages.push("Enter Valid Cost (Number Only)");
        }
        if (TaskDate == undefined) {
            messages.push("Task Date Is Required");
        }
        if (!selectedFrequency) {
            messages.push("Frequency Is Required");
        }
        if (!selectedQCArea || selectedQCArea == null) {
            messages.push("Area Is Required");
        }
        if (!selectedWeek) {
            messages.push("Week Is Required");
        }
        if (!selectedMonth) {
            messages.push("Month Is Required");
        }
        if (!selectedYear) {
            messages.push("Year Is Required");
        }
        setValidationMessages(messages);
        return messages.length > 0;
    };

    const onClickYes = async () => {
        const newTaskDate = moment(TaskDate);
        const newCompletionDate = moment(CompletionDate);
        let updateTaskDate: any;
        let updateCompletionDate: any;
        let complete: any = false;
        if (selectedFrequency === "Yearly") {
            updateTaskDate = newTaskDate.add(1, 'year');
            updateCompletionDate = newCompletionDate.add(1, 'year');
        } else if (selectedFrequency === "Quarterly") {
            updateTaskDate = newTaskDate.add(3, 'months');
            updateCompletionDate = newCompletionDate.add(3, 'months');
        } else if (selectedFrequency === "Monthly") {
            updateTaskDate = newTaskDate.add(1, 'month');
            updateCompletionDate = newCompletionDate.add(1, 'month');
        } else if (selectedFrequency === "Weekly") {
            updateTaskDate = newTaskDate.add(1, 'week');
            updateCompletionDate = newCompletionDate.add(1, 'week');
        } else if (selectedFrequency === "Daily") {
            updateTaskDate = newTaskDate.add(1, 'day');
            updateCompletionDate = newCompletionDate.add(1, 'day');
        } else if (selectedFrequency === "Half Yearly") {
            updateTaskDate = newTaskDate.add(6, 'months');
            updateCompletionDate = newCompletionDate.add(6, 'months');
        } else if (selectedFrequency === "Fortnightly") {
            updateTaskDate = newTaskDate.add(15, 'days');
            updateCompletionDate = newCompletionDate.add(15, 'days');
        }
        let FinalTaskDate;
        let FinalCompletionDate;
        if (isUpdate) {
            FinalTaskDate = !!updateTaskDate ? new Date(updateTaskDate) : undefined;
            FinalCompletionDate = !!updateCompletionDate ? new Date(updateCompletionDate) : undefined;
            complete = false;
        } else {
            FinalTaskDate = !!TaskDate ? new Date(TaskDate) : undefined;
            FinalCompletionDate = !!CompletionDate ? new Date(CompletionDate) : undefined;
            complete = isCompleted;
        }

        const data: any = {
            Title: addPeriodicDataList.Title,
            // UnitPerYear: parseInt(addPeriodicDataList.UnitPerYear),
            Cost: !!addPeriodicDataList?.Cost ? addPeriodicDataList.Cost : null,
            TaskDate: FinalTaskDate,
            CompletionDate: FinalCompletionDate,
            Area: selectedQCArea,
            Frequency: selectedFrequency,
            JobCompletion: selectedJobCompletion,
            Week: selectedWeek,
            Month: selectedMonth,
            Year: selectedYear,
            SiteNameId: !!props.siteMasterId ? props.siteMasterId : 0,
            WorkType: selectedWorkType,
            EventNumber: addPeriodicDataList.EventNumber,
            Hours: addPeriodicDataList.Hours.toString(),
            StaffNumber: addPeriodicDataList.StaffNumber,
            IsCompleted: complete,
            IsNotification: isNotification,
            SubLocation: selectedSubLocation,
        };

        const Createdata: any = {
            Title: addPeriodicDataList.Title,
            TaskDate: !!TaskDate ? new Date(TaskDate) : undefined,
            CompletionDate: !!CompletionDate ? new Date(CompletionDate) : undefined,
            PeriodicId: props.dataObj[0]?.ID,
        };
        if (isUpdate) {
            await props.provider.createItem(Createdata, ListNames.PeriodicHistory).then(async (item: any) => {

                console.log("Periodic History Insert Succefully");
            }).catch(err => console.log(err));
            await props.provider.updateItemWithPnP(data, ListNames.Periodic, props.dataObj[0]?.ID);
            console.log("Update");
            setIsLoading(false);
            const toastMessage = 'Periodic history update successfully!';
            const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
            const toastId = toastService.loading('Loading...');
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
        } else {

        }
        hidePopup();

    };

    const onClickNo = async () => {
        setIsLoading(true);
        const data: any = {
            Title: addPeriodicDataList.Title,
            // UnitPerYear: parseInt(addPeriodicDataList.UnitPerYear),
            Cost: !!addPeriodicDataList?.Cost ? addPeriodicDataList.Cost : null,
            TaskDate: !!TaskDate ? new Date(TaskDate) : undefined,
            CompletionDate: !!CompletionDate ? new Date(CompletionDate) : undefined,
            Area: selectedQCArea,
            Frequency: selectedFrequency,
            JobCompletion: selectedJobCompletion,
            Week: selectedWeek,
            Month: selectedMonth,
            Year: selectedYear,
            SiteNameId: !!props.siteMasterId ? props.siteMasterId : 0,
            WorkType: selectedWorkType,
            EventNumber: addPeriodicDataList.EventNumber,
            Hours: addPeriodicDataList.Hours.toString(),
            StaffNumber: addPeriodicDataList.StaffNumber,
            IsCompleted: isCompleted,
            IsNotification: isNotification,
            SubLocation: selectedSubLocation,
            // SubLocation: addPeriodicDataList.SubLocation
        };
        if (isUpdate) {
            await props.provider.updateItemWithPnP(data, ListNames.Periodic, props.dataObj[0]?.ID);
            console.log("Update");
            setIsLoading(false);
            const toastMessage = 'Periodic detail updated successfully!';
            const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
            const toastId = toastService.loading('Loading...');
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
        } else {
            await props.provider.createItem(data, ListNames.Periodic).then(async (item: any) => {
                console.log("InsertSuccefully");
            }).catch(err => console.log(err));
            setIsLoading(false);
            const toastMessage = 'New Periodic created successfully!!';
            const toastId = toastService.loading('Loading...');
            const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });

        }
    };

    const onClick_SavePeriodic = async (evt: { preventDefault: () => void; }) => {
        try {
            if (validateForm()) {
                toggleHideDialog();
                evt.preventDefault();
            }
            else {
                if (isCompleted === true) {
                    showPopup();
                } else {
                    //    CODE 
                    setIsLoading(true);
                    const data: any = {
                        Title: addPeriodicDataList.Title,
                        // UnitPerYear: parseInt(addPeriodicDataList.UnitPerYear),
                        Cost: !!addPeriodicDataList?.Cost ? addPeriodicDataList.Cost : null,
                        TaskDate: !!TaskDate ? new Date(TaskDate) : undefined,
                        CompletionDate: !!CompletionDate ? new Date(CompletionDate) : undefined,
                        Area: selectedQCArea,
                        Frequency: selectedFrequency,
                        JobCompletion: selectedJobCompletion,
                        Week: selectedWeek,
                        Month: selectedMonth,
                        Year: selectedYear,
                        SiteNameId: !!props.siteMasterId ? props.siteMasterId : 0,
                        WorkType: selectedWorkType,
                        EventNumber: addPeriodicDataList.EventNumber,
                        Hours: addPeriodicDataList.Hours.toString(),
                        StaffNumber: addPeriodicDataList.StaffNumber,
                        IsCompleted: isCompleted,
                        IsNotification: isNotification,
                        SubLocation: selectedSubLocation,
                        // SubLocation: addPeriodicDataList.SubLocation,
                    };
                    if (isUpdate) {
                        await props.provider.updateItemWithPnP(data, ListNames.Periodic, props.dataObj[0]?.ID);
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            SiteNameId: props.siteMasterId,
                            ActionType: "Update",
                            EntityType: UserActionEntityTypeEnum.Periodic,
                            EntityId: Number(props.dataObj[0]?.ID),
                            EntityName: addPeriodicDataList.Title,
                            Details: `Update Periodic`,
                            StateId: props?.componentProp?.qCStateId,
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                        setIsLoading(false);
                        const toastMessage = 'Periodic detail updated successfully!';
                        const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                        const toastId = toastService.loading('Loading...');
                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });
                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    } else {
                        await props.provider.createItem(data, ListNames.Periodic).then(async (item: any) => {
                            let createdId = item.data.Id;
                            const logObj = {
                                UserName: props?.loginUserRoleDetails?.title,
                                SiteNameId: props.siteMasterId,
                                ActionType: "Create",
                                EntityType: UserActionEntityTypeEnum.Periodic,
                                EntityId: Number(createdId),
                                EntityName: addPeriodicDataList.Title,
                                Details: `Add Periodic`,
                                StateId: props?.componentProp?.qCStateId,
                            };
                            void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                        }).catch(err => console.log(err));
                        setIsLoading(false);
                        const toastMessage = 'New Periodic created successfully!!';
                        const toastId = toastService.loading('Loading...');
                        const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });

                    }
                }
            }

        } catch (error) {
            console.log(error);
            const errorObj = { ErrorMethodName: "onClick_SavePeriodic", CustomErrormessage: "error in save periodic", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }

    };

    const returnErrorMessage = () => {
        return (
            validationMessages.length > 0 &&
            <ul>
                {validationMessages.map((vm: React.Key | null | undefined) => <li className="errorPoint" key={vm}>{vm}</li>)}
            </ul>
        );

    };


    React.useEffect(() => {
        if (!!props.dataObj) {
            let editCompleteDate = new Date(props.dataObj[0]?.CompletionDateUpdate);
            let editTaskDate = new Date(props.dataObj[0]?.TaskDateUpdate);
            setIsDeleted(false);
            setIsUpdate(true);
            addPeriodicDataList.Title = props.dataObj[0]?.Title;
            addPeriodicDataList.Cost = props.dataObj[0]?.Cost;
            // addPeriodicDataList.UnitPerYear = props.dataObj[0]?.UnitPerYear;
            addPeriodicDataList.EventNumber = props.dataObj[0]?.EventNumber;
            addPeriodicDataList.Hours = props.dataObj[0]?.Hours;
            addPeriodicDataList.StaffNumber = props.dataObj[0]?.StaffNumber;
            // addPeriodicDataList.SubLocation = props.dataObj[0]?.SubLocation;
            setSelectedWeek(props.dataObj[0]?.Week);
            setSelectedFrequency(props.dataObj[0]?.Frequency);
            setSelectedJobCompletion(props.dataObj[0]?.JobCompletion);
            setCompletionDate(editCompleteDate);
            setTaskDate(editTaskDate);
            setSelectedMonth(props.dataObj[0]?.Month);
            setSelectedYear(props.dataObj[0]?.Year);
            setSelectedQCArea(props.dataObj[0]?.QCArea);
            setSelectedSubLocation(props.dataObj[0]?.SubLocation);
            setSelectedWorkType(props.dataObj[0]?.WorkType);
            setIsCompleted(props.dataObj[0]?.IsCompleted);
            setIsNotification(props.dataObj[0]?.IsNotification);

        }
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);
    return <>
        {isLoading && <Loader />}
        <div className="boxCard">
            <div className="formGroup">
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                <div><h1 className="mainTitle">Periodic Form</h1></div>
                                <div className="dFlex">
                                    <div>
                                        <PrimaryButton className="btn btn-danger justifyright floatright"
                                            onClick={() => {
                                                const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });

                                            }}
                                            text="Close" />
                                    </div>
                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.componentProp.breadCrumItems || []}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Area<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <PeriodicCommonFilter
                                                onPeriodicChange={onQCAreaChange}
                                                provider={props.provider}
                                                selectedPeriodic={selectedQCArea}
                                                defaultOption={!!selectedQCArea ? selectedQCArea : props.dataObj ? props.dataObj[0]?.AssetType : ""}
                                                siteNameId={props.siteMasterId}
                                                Title="Area"
                                                placeHolder="Select Area"
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        {/* <Label className="formLabel">Sub Location<span className="required">*</span></Label>
                                        <TextField className="formControl" name="SubLocation" value={addPeriodicDataList.SubLocation} onChange={addPeriodicData} /> */}
                                        <Label className="formLabel">Sub Location<span className="required"></span></Label>
                                        <div className="formControl">
                                            <PeriodicCommonFilter
                                                onPeriodicChange={onSubLocationChange}
                                                provider={props.provider}
                                                selectedPeriodic={selectedSubLocation}
                                                defaultOption={!!selectedSubLocation ? selectedSubLocation : props.dataObj ? props.dataObj[0]?.SubLocation : ""}
                                                siteNameId={props.siteMasterId}
                                                Title="Sub Location"
                                                placeHolder="Select Sub Location"
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Work Type<span className="required"></span></Label>
                                        <PeriodicCommonFilter
                                            onPeriodicChange={onWorkTypeChange}
                                            provider={props.provider}
                                            selectedPeriodic={selectedWorkType}
                                            defaultOption={!!selectedWorkType ? selectedWorkType : props.dataObj ? props.dataObj[0]?.WorkType : ""}
                                            siteNameId={props.siteMasterId}
                                            Title="Work Type"
                                            placeHolder="Select Work Type"
                                        />
                                        {/* <WorkTypeFilter

                                            selectedWorkType={selectedWorkType}
                                            defaultOption={!!selectedWorkType ? selectedWorkType : props.dataObj ? props.dataObj[0]?.WorkType : ""}
                                            onWorkTypeChange={onWorkTypeChange}
                                            provider={props.provider}
                                            isRequired={true} /> */}
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Periodic Title<span className="required">*</span></Label>
                                        <TextField className="formControl" name="Title" value={addPeriodicDataList.Title} onChange={addPeriodicData} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Frequency<span className="required">*</span></Label>
                                        <FrequencyFilter
                                            selectedFrequency={selectedFrequency}
                                            defaultOption={!!selectedFrequency ? selectedFrequency : props.dataObj ? props.dataObj[0]?.Frequency : ""}
                                            onFrequencyChange={onFrequencyChange}
                                            provider={props.provider}
                                            isRequired={true} />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Week<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <WeekFilter
                                                selectedWeek={selectedWeek}
                                                defaultOption={!!selectedWeek ? selectedWeek : props.dataObj ? props.dataObj[0]?.Week : ""}
                                                onWeekChange={onWeekChange}
                                                provider={props.provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Month<span className="required">*</span></Label>
                                        <MonthFilter
                                            selectedMonth={selectedMonth}
                                            defaultOption={!!selectedMonth ? selectedMonth : props.dataObj ? props.dataObj[0]?.Month : ""}
                                            onMonthChange={onMonthChange}
                                            provider={props.provider}
                                            isRequired={true} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">

                                        <Label className="formLabel">Year<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <YearFilter
                                                selectedYear={selectedYear}
                                                defaultOption={!!selectedYear ? selectedYear : props.dataObj ? props.dataObj[0]?.Year : ""}
                                                onYearChange={onYearChange}
                                                provider={props.provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Job Completion<span className="required"></span></Label>
                                        <div className="formControl">
                                            <JobCompletionFilter
                                                selectedJobCompletion={selectedJobCompletion}
                                                defaultOption={!!selectedJobCompletion ? selectedJobCompletion : props.dataObj ? props.dataObj[0]?.JobCompletion : ""}
                                                onJobCompletionChange={onJobCompletionChange}
                                                provider={props.provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Task Date<span className="required">*</span></Label>
                                        <DatePicker allowTextInput
                                            ariaLabel="Select a date."
                                            value={TaskDate}
                                            onSelectDate={setTaskDate as (date?: Date) => void}
                                            formatDate={onFormatDate}
                                            strings={defaultDatePickerStrings} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Completion Date<span className="required"></span></Label>
                                        <DatePicker allowTextInput
                                            ariaLabel="Select a date."
                                            value={CompletionDate}
                                            className="formControl"
                                            onSelectDate={setCompletionDate as (date?: Date) => void}
                                            formatDate={onFormatDate}
                                            strings={defaultDatePickerStrings} />
                                    </div>
                                    {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Unit Per Year<span className="required"></span></Label>
                                        <TextField className="formControl" name="UnitPerYear" value={addPeriodicDataList.UnitPerYear} onChange={addPeriodicData} />
                                    </div> */}
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 mb5">
                                        <Label className="formLabel">Event Number<span className="required"></span></Label>
                                        <TextField className="formControl" name="EventNumber" value={addPeriodicDataList.EventNumber} onChange={addPeriodicData} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Hours<span className="required"></span></Label>
                                        <TextField className="formControl" name="Hours" value={addPeriodicDataList.Hours} onChange={addPeriodicData} />
                                        {displayerror &&
                                            <div className="requiredlink">Enter Valid Hours</div>}
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Cost<span className="required"></span></Label>
                                        <TextField className="formControl" name="Cost" value={addPeriodicDataList.Cost} onChange={addPeriodicData} />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Staff Number<span className="required"></span></Label>
                                        <TextField className="formControl" name="StaffNumber" value={addPeriodicDataList.StaffNumber} onChange={addPeriodicData} />
                                    </div>


                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <div className="ms-Grid-row">
                                            {isUpdate === true &&
                                                <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                                                    <Toggle
                                                        className="formtoggle"
                                                        label="Is Completed?"
                                                        checked={isCompleted}
                                                        onChange={(event, checked) => {
                                                            setIsCompleted(checked ? checked : false);
                                                        }}
                                                    />
                                                </div>}
                                            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                                                <Toggle
                                                    className="formtoggle"
                                                    label="Is Notification?"
                                                    checked={isNotification}
                                                    onChange={(event, checked) => {
                                                        setIsNotification(checked ? checked : false);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                        {isUpdate ? <PrimaryButton disabled={displayerror} className="btn btn-primary" onClick={onClick_SavePeriodic} text="Update" /> : <PrimaryButton className="btn btn-primary" disabled={displayerror} onClick={onClick_SavePeriodic} text="Save" />}
                                        <PrimaryButton
                                            style={{ margin: "5px", marginTop: "10px" }}
                                            className="btn btn-danger"
                                            text="Close"
                                            onClick={() => {
                                                const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });

                                            }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >

        {hideDialog && <CustomModal
            isModalOpenProps={hideDialog}
            setModalpopUpFalse={() => {
                toggleHideDialog();
            }}
            subject={"Data Is Missing "}
            message={returnErrorMessage() as any}
            closeButtonText={"Close"}
        />
        }
        {false &&
            <Dialog
                hidden={hideDialog}
                onDismiss={toggleHideDialog}
                dialogContentProps={dialogContentProps}
                modalProps={modalProps}>
                {validationMessages.length > 0 &&
                    <ul>
                        {validationMessages.map((vm: React.Key | null | undefined) => <li key={vm}>{vm}</li>)}
                    </ul>
                }
                <PrimaryButton text="Close" onClick={toggleHideDialog} className='me1 btn-clr' />
            </Dialog>
        }

        {isPopupVisible && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopup}
                >
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Create Task</h2>
                            <p className="mt-3">Do you want to create a new task {selectedFrequency}?</p>
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
    </>;

};