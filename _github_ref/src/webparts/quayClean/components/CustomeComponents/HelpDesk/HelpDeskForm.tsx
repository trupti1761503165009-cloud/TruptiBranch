/* eslint-disable @typescript-eslint/no-use-before-define */
import { Breadcrumb, Label, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { IHelpDeskFormProps, IHelpDeskFormState, IHelpDeskItem } from "../../../../../Interfaces/IAddNewHelpDesk";
//import { EventFilter } from "../../../../../Common/Filter/EventFilter";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { DateConvention, DateTimePicker, TimeConvention, TimeDisplayControlType } from "@pnp/spfx-controls-react";
import { getChoicesListOptions, logGenerator, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { HDCommonFilter } from "../../../../../Common/Filter/HDCommonFilter";

export const HelpDeskForm = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [catagoryOption, setCatagoryOption] = React.useState<any[]>([]);
    const [HDStatusyOption, setHDStatusyOption] = React.useState<any[]>([]);
    const [priorityOption, setPriorityyOption] = React.useState<any[]>([]);
    const [SublocationOption, setSublocationyOption] = React.useState<any[]>([]);
    const [HelpDeskNameOption, setHelpDeskNameOption] = React.useState<any[]>([]);
    const [CallerDataOption, setCallerDataOption] = React.useState<any[]>([]);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [selectedHDCaller, setSelectedHDCaller] = React.useState<any>("");
    const [FieldData, setFieldData] = React.useState<any>();
    const [validationFields, setValidationFields] = React.useState({ required: [] });

    const FieldsArray = React.useRef<any>([]);
    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        //siteMasterItems: [],
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const [newFromObj, setNewFromObj] = React.useState<IHelpDeskItem>({
        Id: 0,
        Title: "",
        StartingDateTime: undefined,
        Caller: "",
        Location: "",
        Area: "",
        HDCategory: "",
        ReportHelpDesk: false,
        HDStatus: "",
        EventName: "",
        QCPriority: "",
        SiteNameId: props.originalSiteMasterId,
        HelpDeskName: "",
        SubLocation: "",
        CompletionDateTime: undefined,
    });


    const getHelpDeskDetailByID = (Id: number) => {
        if (!!Id) {
            const selectItem = ["Id,Title,Area,StartingDateTime,CompletionDateTime,Caller,Location,QCArea/Id,QCArea/Title,HDCategory,ReportHelpDesk,HDStatus,EventName,HelpDeskName,SubLocation,QCPriority,SiteName/Id,SiteName/Title"];
            const expandItem = ["SiteName,QCArea"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.HelpDesk,
                select: selectItem,
                expand: expandItem,
                filter: filter,
                id: Id
            };
            return props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    const errorMessageGenrate = (item: any) => {
        const error: any[] = [];
        let errormessage: any;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "Title":
                        error.push(<div>Help Desk Description is required</div>);
                        break;
                    case "StartingDateTime":
                        error.push(<div>Starting Date & Time is required</div>);
                        break;
                    case "Location":
                        error.push(<div>Location is required</div>);
                        break;
                    case "Caller":
                        error.push(<div>Caller is required</div>);
                        break;
                    case "Area":
                        error.push(<div> Area is required</div>);
                        break;
                    case "HDCategory":
                        error.push(<div>Category is required</div>);
                        break;
                    case "ReportHelpDesk":
                        error.push(<div>Report Help Desk is required</div>);
                        break;
                    case "HDStatus":
                        error.push(<div>Status is required</div>);
                        break;
                    case "EventName":
                        error.push(<div>Event Name is required</div>);
                        break;
                    case "QCPriority":
                        error.push(<div>Priority is required</div>);
                        break;
                    case "SiteNameId":
                        error.push(<div>Site Name is required</div>);
                        break;
                    case "HelpDeskName":
                        error.push(<div>Help Desk Name is required</div>);
                        break;
                    default:
                        break;
                }
            }
        }
        errormessage = <><ul>{error.map((i: any) => {
            return <li className="errorPoint">{i}</li>;
        })}</ul></>;
        return errormessage;
        return error;
    };

    const onHDChangeCaller = (CallerId: any): void => {
        setSelectedHDCaller(CallerId);
        setNewFromObj(prevState => ({ ...prevState, Caller: CallerId }));
    };
    const [selectedHDLocation, setSelectedHDLocation] = React.useState<any>("");
    const [selectedHDArea, setSelectedHDArea] = React.useState<any>("");
    const [selectedHDCategory, setSelectedHDCategory] = React.useState<any>("");
    const [selectedHDStatus, setSelectedHDStatus] = React.useState<any>("");
    const [selectedQCPriority, setSelectedQCPriority] = React.useState<any>("");
    const [selectedSubLocation, setSelectedSubLocation] = React.useState<any>("");
    const [selectedHelpDeskName, setSelectedHelpDeskName] = React.useState<any>("");

    const onHDChangeLocation = (LocationId: any): void => {
        setSelectedHDLocation(LocationId);
        setNewFromObj(prevState => ({ ...prevState, Location: LocationId }));
    };
    const onHDChangeArea = (AreaId: any): void => {
        setSelectedHDArea(AreaId);
        setNewFromObj(prevState => ({ ...prevState, Area: AreaId }));
    };
    const onHDChangeHDCategory = (CategoryId: any): void => {
        setSelectedHDCategory(CategoryId);
        setNewFromObj(prevState => ({ ...prevState, HDCategory: CategoryId }));
    };
    const onHDChangeHDStatus = (StatusId: any): void => {
        setSelectedHDStatus(StatusId);
        setNewFromObj(prevState => ({ ...prevState, HDStatus: StatusId }));
    };
    const onHDChangeQCPriority = (QCPriorityId: any): void => {
        setSelectedQCPriority(QCPriorityId);
        setNewFromObj(prevState => ({ ...prevState, QCPriority: QCPriorityId }));
    };

    const onHDChangeSubLocation = (SubLocationId: any): void => {
        setSelectedSubLocation(SubLocationId);
        setNewFromObj(prevState => ({ ...prevState, SubLocation: SubLocationId }));
    };
    const onHDChangeHelpDeskName = (HelpDeskNameId: any): void => {
        setSelectedHelpDeskName(HelpDeskNameId);
        setNewFromObj(prevState => ({ ...prevState, HelpDeskName: HelpDeskNameId }));
    };

    const onClickFieldData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Field,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.HelpDeskField,
                filter: `SiteNameId eq '${props.componentProps.originalSiteMasterId}'`
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Field: !!data.Field ? data.Field : '',
                            }
                        );
                    });
                    setFieldData(listData);
                    if (listData.length > 0) {
                        FieldsArray.current = listData[0]?.Field;
                    } else {
                        FieldsArray.current = [];
                    }
                    updateValidationFields();
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

    const updateValidationFields = () => {
        const FieldsArrayCurrent = FieldsArray.current || []; // Ensure it's an array
        const validationMapping: { [key: string]: string } = {
            "Help Desk Description": "Title",
            "Caller": "Caller",
            "Starting Date": "StartingDateTime",
            "Location": "Location",
            "Area": "Area",
            "Category": "HDCategory",
            "Reported Help Desk": "ReportHelpDesk",
            "Status": "HDStatus",
            "Event Name": "EventName",
            "Priority": "QCPriority",
            "Help Desk Name": "HelpDeskName"
        };
        let newRequiredFields: string[];
        if (FieldsArrayCurrent.length === 0) {
            newRequiredFields = Object.values(validationMapping);
        } else {
            newRequiredFields = FieldsArrayCurrent
                .map((field: any) => validationMapping[field])
                .filter(Boolean);
        }
        setValidationFields((prevState: any) => ({
            ...prevState,
            required: newRequiredFields
        }));
    };


    const onClickSaveOrUpdate = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            let isValidateRecord;
            if (!!newFromObj)
                isValidateRecord = ValidateForm(newFromObj, validationFields);

            let error: any;
            let isValid: boolean;
            if (!!isValidateRecord) {
                if (isValidateRecord?.isValid === false) {
                    isValid = isValidateRecord?.isValid;
                    error = errorMessageGenrate(isValidateRecord);
                } else {
                    isValid = true;
                }
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            } else {
                isValid = false;
                error = <ul><li>Please fill the form  </li></ul>;
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            }
            if (isValid) {
                const toastMessage = (newFromObj.Id && newFromObj.Id > 0) ? 'Details updated successfully!' : 'Helpdesk created successfully!';
                if (newFromObj.Id && newFromObj.Id > 0) {
                    await props.provider.updateItemWithPnP(newFromObj, ListNames.HelpDesk, newFromObj.Id);
                }
                else {
                    await props.provider.createItem(newFromObj, ListNames.HelpDesk);
                }
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                });
                setIsLoading(false);
            } else {
                toastService.dismiss(toastId);
                setIsLoading(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickSaveOrUpdate HelpDeskForm"
            };
            void logGenerator(props.provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };


    React.useEffect(() => {
        onClickFieldData();
        try {
            setIsLoading(true);

            // eslint-disable-next-line no-void
            void (async () => {
                const [catagory, status, priority, helpDeskOptions, Caller, SubLocation] = await Promise.all([getChoicesListOptions(props.provider, ListNames.HelpDesk, "HD Category"), getChoicesListOptions(props.provider, ListNames.HelpDesk, "HDStatus"), getChoicesListOptions(props.provider, ListNames.HelpDesk, "QCPriority"),
                getChoicesListOptions(props.provider, ListNames.HelpDesk, "HelpDeskName"),
                getChoicesListOptions(props.provider, ListNames.HelpDesk, "Caller"),
                getChoicesListOptions(props.provider, ListNames.HelpDesk, "SubLocation")
                ]);

                setHelpDeskNameOption(helpDeskOptions);
                setCallerDataOption(Caller);
                setCatagoryOption(catagory);
                setHDStatusyOption(status);
                setPriorityyOption(priority);
                setSublocationyOption(SubLocation);
                if (siteMasterId && siteMasterId > 0) {
                    const objItem = await getHelpDeskDetailByID(siteMasterId);
                    setSelectedHDCaller(objItem.Caller);
                    const items: IHelpDeskItem = {
                        Id: parseInt(objItem.Id),
                        Title: !!objItem.Title ? objItem.Title : "",
                        //SiteName: !!objItem.SiteName ? objItem.SiteName.Title : "",
                        SiteNameId: !!props.originalSiteMasterId ? props.originalSiteMasterId : 0,
                        Caller: !!objItem.Caller ? objItem.Caller : "",
                        Location: !!objItem.Location ? objItem.Location : "",
                        // QCAreaId: !!objItem.QCArea ? objItem.QCArea.Id : 0,
                        Area: !!objItem.Area ? objItem.Area : "",
                        StartingDateTime: !!objItem.StartingDateTime ? new Date(objItem.StartingDateTime) : undefined,
                        HDCategory: !!objItem.HDCategory ? objItem.HDCategory : "",
                        HDStatus: !!objItem.HDStatus ? objItem.HDStatus : "",
                        ReportHelpDesk: objItem.ReportHelpDesk,
                        EventName: !!objItem.EventName ? objItem.EventName : "",
                        HelpDeskName: !!objItem.HelpDeskName ? objItem.HelpDeskName : "",
                        QCPriority: !!objItem.QCPriority ? objItem.QCPriority : "",
                        SubLocation: !!objItem.SubLocation ? objItem.SubLocation : "",
                        CompletionDateTime: !!objItem.CompletionDateTime ? new Date(objItem.CompletionDateTime) : undefined,
                    };
                    setNewFromObj(items);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
                setIsLoading(false);
            })();

        } catch (error) {
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "useEffect Help desk form ", CustomErrormessage: "error in use effect Help desk form", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            console.log(error);
        }

    }, []);

    return <>
        {isLoading && <Loader />}

        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState(prevState => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        <div className="boxCard">
            <div className="formGroup">
                <h1 className="mainTitle">Help Desk form</h1>
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
                        {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl8 mb-3">
                            <div className="ms-Grid-row">
                                {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Description")) && (
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ms-xl6">
                                        <TextField className="formControl" label="Help Desk Description " placeholder="Enter HelpDesk Description"
                                            value={newFromObj?.Title}
                                            required
                                            onChange={(event, value) => {
                                                setNewFromObj(prevState => ({ ...prevState, Title: value }));
                                            }} />
                                    </div>
                                )}
                                {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Caller")) && (
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ms-xl6 ">
                                        <Label className="formLabel">Caller<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <HDCommonFilter
                                                onHDChange={onHDChangeCaller}
                                                provider={props.provider}
                                                selectedHD={selectedHDCaller}
                                                defaultOption={newFromObj?.Caller}
                                                siteNameId={props.componentProps.originalSiteMasterId}
                                                Title="Caller"
                                                placeHolder="Select Caller"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div> */}

                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Description")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <TextField
                                    className="formControl"
                                    label="Help Desk Description"
                                    placeholder="Enter HelpDesk Description"
                                    value={newFromObj?.Title}
                                    required
                                    onChange={(event, value) => {
                                        const trimmed = value?.trimStart();
                                        setNewFromObj(prev => ({ ...prev, Title: trimmed }));
                                    }}
                                />

                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Caller")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Caller<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeCaller}
                                        provider={props.provider}
                                        selectedHD={selectedHDCaller}
                                        defaultOption={newFromObj?.Caller}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Caller"
                                        placeHolder="Select Caller"
                                    />
                                </div>
                            </div>
                        )}
                        {/* 
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <DateTimePicker label={`Starting Date `}
                                    formatDate={(date: Date) => { return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'numeric', day: '2-digit' }).replace(/-/g, '/'); }}
                                    dateConvention={DateConvention.DateTime}
                                    timeConvention={TimeConvention.Hours12}
                                    timeDisplayControlType={TimeDisplayControlType.Dropdown}
                                    value={newFromObj?.StartingDateTime}
                                    onChange={(date?: Date) => {
                                        //if (date !== undefined) {
                                        setNewFromObj(prevState => ({ ...prevState, StartingDateTime: date }));
                                        //}
                                    }}
                                    maxDate={newFromObj?.CompletionDateTime || undefined}
                                />
                            </div>
                        )} */}
                        {/* {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Completion Date")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <DateTimePicker label={`Completion Date`}
                                    formatDate={(date: Date) => { return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'numeric', day: '2-digit' }).replace(/-/g, '/'); }}
                                    dateConvention={DateConvention.DateTime}
                                    timeConvention={TimeConvention.Hours12}
                                    timeDisplayControlType={TimeDisplayControlType.Dropdown}
                                    value={newFromObj?.CompletionDateTime}
                                    onChange={(date?: Date) => {
                                        //if (date !== undefined) {
                                        setNewFromObj(prevState => ({ ...prevState, CompletionDateTime: date }));
                                        //}
                                    }}
                                    minDate={newFromObj?.StartingDateTime || undefined}
                                />
                            </div>
                        )} */}

                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Location")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Location<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeLocation}
                                        provider={props.provider}
                                        selectedHD={selectedHDLocation}
                                        defaultOption={newFromObj?.Location}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Location"
                                        placeHolder="Select Location"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Sub Location")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Sub Location<span className="required"></span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeSubLocation}
                                        provider={props.provider}
                                        selectedHD={selectedSubLocation}
                                        defaultOption={newFromObj?.SubLocation}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Sub Location"
                                        placeHolder="Select Sub Location"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Area")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Area<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeArea}
                                        provider={props.provider}
                                        selectedHD={selectedHDArea}
                                        defaultOption={newFromObj?.Area}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Area"
                                        placeHolder="Select Area"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Category")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Category<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeHDCategory}
                                        provider={props.provider}
                                        selectedHD={selectedHDCategory}
                                        defaultOption={newFromObj?.HDCategory}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Category"
                                        placeHolder="Select Category"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Status")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Status<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeHDStatus}
                                        provider={props.provider}
                                        selectedHD={selectedHDStatus}
                                        defaultOption={newFromObj?.HDStatus}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Status"
                                        placeHolder="Select Status"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Name")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Help Desk Name<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeHelpDeskName}
                                        provider={props.provider}
                                        selectedHD={selectedHelpDeskName}
                                        defaultOption={newFromObj?.HelpDeskName}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="HelpDesk"
                                        placeHolder="Select Help Desk Name"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Priority")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Label className="formLabel">Prority<span className="required">*</span></Label>
                                <div className="formControl">
                                    <HDCommonFilter
                                        onHDChange={onHDChangeQCPriority}
                                        provider={props.provider}
                                        selectedHD={selectedQCPriority}
                                        defaultOption={newFromObj?.QCPriority}
                                        siteNameId={props.componentProps.originalSiteMasterId}
                                        Title="Priority"
                                        placeHolder="Select Priority"
                                    />
                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Event Name")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <div className="">
                                    <TextField
                                        className=""
                                        label="Event Name"
                                        placeholder="Enter Event Name"
                                        value={newFromObj?.EventName}
                                        required
                                        onChange={(event, value) => {
                                            const cleaned = value?.trim() === "" ? "" : value;   // ⬅ KEY FIX
                                            setNewFromObj(prevState => ({ ...prevState, EventName: cleaned }));
                                        }}
                                    />

                                </div>
                            </div>
                        )}
                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Reported Help Desk")) && (
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 mb-3">
                                <Toggle
                                    className="formControl formtoggle"
                                    label="Reported Help Desk"
                                    checked={newFromObj?.ReportHelpDesk}
                                    onChange={(event, checked) => {
                                        setNewFromObj(prevState => ({ ...prevState, ReportHelpDesk: checked }));
                                    }}
                                />
                            </div>
                        )}
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                className="btn btn-primary"
                                text={state.isAddNewHelpDesk ? 'Save' : "Update"}
                                onClick={onClickSaveOrUpdate}
                            />
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                className="btn btn-danger"
                                text="Close"
                                onClick={() => {
                                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                    props.manageComponentView({
                                        currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey", breadCrumItems: breadCrumItems,
                                    });
                                }}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div >
    </>;

};