/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { DefaultButton, DialogFooter, FocusTrapZone, Link, PersonaSize, Popup, PrimaryButton, TooltipHost } from "office-ui-fabric-react";
import { Layer, mergeStyleSets, Overlay, SelectionMode, Toggle } from "@fluentui/react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { _copyAndSortNew, generateExcelTable, getCAMLQueryFilterExpression, getErrorMessageValue, logGenerator, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import CamlBuilder from "camljs";
import moment from "moment";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { IManageUsersState } from "../ManageSites/Users/ManageUsersData";
import { UserPersonaById } from "../../CommonComponents/UserPersonaById";
import { IUserGridData } from "../ManageSites/IMangeSites";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { IExportColumns } from "../UserActivityLog";
import TabMenu from "../../CommonComponents/TabMenu";
import { EmployeeCountCard } from "./EmployeeCountCard";
import AutoComplete from "./AutoComplete";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IAssociateChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    siteMasterId?: number;
}

export const Employee = (props: IAssociateChemicalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [selectedState, setSelectedState] = React.useState<any[]>([]);
    const [Data, setData] = React.useState<any[]>([]);
    const [empIds, setempIds] = React.useState<any[]>([]);
    const [empFirstNames, setempFirstNames] = React.useState<any[]>([]);
    const [empLastNames, setempLastNames] = React.useState<any[]>([]);
    const [empEmails, setempEmails] = React.useState<any[]>([]);
    const [empPhones, setempPhones] = React.useState<any[]>([]);
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [columnsEmployee, setcolumnsEmployee] = React.useState<any>([]);
    const [state, setState] = React.useState<IManageUsersState>({
        userData: [],
        isSort: false,
        expandedUsers: {},
        userGridData: [],
        filterUserGridData: [],
        siteMasterData: [],
        userActivityLogData: [],
        isLoading: true,
        currentPageNumber: 0,
        pagedItems: [],
        selectedSitesIDS: [],
        selectedUserType: "",
        userTypeOptions: [],
        siteData: [],
        userNameOptions: [],
        selectedUserNames: [],
        currentPage: 1,
        itemsPerPage: 50,
        startedIndex: null,
        endedIndex: null,
        sortColumnName: ""
    })
    const [currentView, setCurrentView] = React.useState<string>('grid');
    const [isPopupVisible4, { setTrue: showPopup4, setFalse: hidePopup4 }] = useBoolean(false);
    const [width, setWidth] = React.useState<string>("400px");

    const CheckBoxId = React.useRef<any>("");
    const InActiveMessage = React.useRef<any>("");
    const [filterType, setFilterType] = React.useState<any>("");
    const [selectedFirstName, setSelectedFirstName] = React.useState<any>("");
    const [selectedLastName, setSelectedLastName] = React.useState<any>("");
    const [selectedEmail, setSelectedEmail] = React.useState<any>("");
    const [selectedPhone, setSelectedPhone] = React.useState<any>("");

    const handleOptionSelect = (value: any, type: any) => {
        if (type === "First Name") {
            setSelectedFirstName(value);
        } else if (type === "Last Name") {
            setSelectedLastName(value);
        } else if (type === "Email") {
            setSelectedEmail(value);
        } else if (type === "Phone") {
            setSelectedPhone(value);
        }
    };

    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("400px");
        }
    }, [window.innerWidth]);

    React.useEffect(() => {
        setFilterType('Active');
    }, []);

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

    const getSummary = (ListData: any) => {
        const totalEmployee = ListData.length;
        const active = ListData.filter((item: any) => item.Inactive !== true).length;
        const inactive = ListData.filter((item: any) => item.Inactive === true).length;
        setSummaryData({
            totalEmployee,
            active,
            inactive
        });
    };

    const onTabStateChange = (option: any): void => {
        setSelectedState([option]);
        if (option === "") {
            setSelectedState([]);
        }
    };
    const onClickNo = async () => {
        hidePopup4();
    }
    const _Data = async () => {
        setIsLoading(true);
        try {
            const filterFieldsSite: ICamlQueryFilter[] = [];
            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: "IsDeleted",
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.NotEqualTo
                },
                // {
                //     fieldName: "Inactive",
                //     fieldValue: true,
                //     fieldType: FieldType.Boolean,
                //     LogicalType: LogicalType.NotEqualTo
                // }
            ];
            if (selectedState.length > 0) {
                filterFieldsSite.push({
                    fieldName: `State`,
                    fieldValue: selectedState,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            }
            if (selectedFirstName !== "") {
                filterFieldsSite.push({
                    fieldName: `FirstName`,
                    fieldValue: selectedFirstName,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (selectedLastName !== "") {
                filterFieldsSite.push({
                    fieldName: `LastName`,
                    fieldValue: selectedLastName,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (selectedEmail !== "") {
                filterFieldsSite.push({
                    fieldName: `Email`,
                    fieldValue: selectedEmail,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (selectedPhone !== "") {
                filterFieldsSite.push({
                    fieldName: `Phone`,
                    fieldValue: selectedPhone,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            const camlQuery = new CamlBuilder()
                .View(["ID",
                    "Title",
                    "FirstName",
                    "LastName",
                    "Email",
                    "Phone",
                    "State",
                    "Created",
                    "Modified",
                    "EmployeeId",
                    "IsQuaycleanUser",
                    "Modified",
                    "IsDeleted",
                    "Inactive"
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();
            const siteFilter: any[] = getCAMLQueryFilterExpression([...filterFieldsSite, ...filterFields]);
            camlQuery.Where().All(siteFilter);
            let finalQuery = camlQuery.ToString();
            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.QuaycleanEmployee,
                queryXML: finalQuery,
                pageToken: "",
                pageLength: 100000
            }

            const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            const results = localResponse?.Row;
            if (!!results) {
                let ListData = results.map((data: any) => ({
                    ID: Number(data.ID),
                    Title: data.Title || "",
                    StateId: data.State?.map((state: any) => state.lookupId) || [],
                    State: data.State?.map((state: any) => state.lookupValue) || [],
                    StateName: (data.State?.map((state: any) => state.lookupValue) || []).join(", "),
                    FirstName: data.FirstName || "",
                    LastName: data.LastName || "",
                    Email: data.Email || "",
                    Phone: data.Phone || "",
                    EmployeeId: Number(data.EmployeeId) || "",
                    IsQuaycleanUser: data?.IsQuaycleanUser == "Yes" ? true : false,
                    IsQuaycleanUserValue: data?.IsQuaycleanUser || "No",
                    Modified: !!data.Modified ? data.Modified : null,
                    IsDeleted: data.IsDeleted == "Yes" ? true : false,
                    IsDeletedYesNo: data.IsDeleted ? 'Yes' : 'No',
                    Inactive: data.Inactive == "Yes" ? true : false,
                    InactiveYesNo: data.Inactive || 'No',
                }));
                ListData = ListData.sort((a: any, b: any) => {
                    const nameA = (a.FirstName + ' ' + a.LastName).toLowerCase();
                    const nameB = (b.FirstName + ' ' + b.LastName).toLowerCase();
                    return nameA.localeCompare(nameB);
                });

                getSummary(ListData);
                const employeeIds: number[] = ListData
                    .filter((item: any) => item.EmployeeId !== "" && item.EmployeeId !== undefined)
                    .map((item: any) => Number(item.EmployeeId));
                setempIds(employeeIds);

                const employeeFirstName: string[] = Array.from(new Set(
                    ListData
                        .filter((item: any) => item.FirstName !== "" && item.FirstName !== undefined)
                        .map((item: any) => item.FirstName)
                ));
                setempFirstNames(employeeFirstName);

                const employeeLastName: string[] = Array.from(new Set(
                    ListData
                        .filter((item: any) => item.LastName !== "" && item.LastName !== undefined)
                        .map((item: any) => item.LastName)
                ));
                setempLastNames(employeeLastName);

                const employeeEmails: string[] = Array.from(new Set(
                    ListData
                        .filter((item: any) => item.Email !== "" && item.Email !== undefined)
                        .map((item: any) => item.Email)
                ));
                setempEmails(employeeEmails);

                const employeePhones: string[] = Array.from(new Set(
                    ListData
                        .filter((item: any) => item.Phone !== "" && item.Phone !== undefined)
                        .map((item: any) => item.Phone)
                ));
                setempPhones(employeePhones);
                setData(ListData);
                // setIsRefreshGrid(true);
            }

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    };

    const onToggleChange = (itemID: any, checked: boolean | undefined): void => {
        CheckBoxId.current = itemID.ID;
        InActiveMessage.current = checked ? "Inactive" : "Active";

        if (InActiveMessage.current !== "") {
            showPopup4();
        }

        itemID.IsActive = checked;
    };
    const formatPhoneNumber = (phone: string | number): string => {
        let digits = phone.toString().replace(/\D/g, ''); // remove non-digits

        if (digits.length === 9) {
            digits = '0' + digits; // prepend 0 if missing
        }

        if (digits.length === 10) {
            return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
        }

        return phone.toString(); // fallback to raw value
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "Employee Id", key: "EmployeeId" },
                { header: "First Name", key: "FirstName" },
                { header: "Last Name", key: "LastName" },
                { header: "State", key: "StateName" },
                { header: "Phone", key: "Phone" },
                { header: "Email", key: "Email" },
                { header: "Quayclean User?", key: "IsQuaycleanUserValue" },
                { header: "Inactive", key: "InactiveYesNo" },
            ];

            generateExcelTable(Data, exportColumns, `Quayclean Employee.xlsx`);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "onclickExportToExcel",
                CustomErrormessage: "error in download",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onclickEdit = () => {
        try {
            setisDisplayEDbtn(false);
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddEmployee, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddEmployee, empIds: empIds, empEmails: empEmails, empPhones: empPhones, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            // void logGenerator(props.provider, errorObj);
        }
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem(null);
            setisDisplayEDbtn(false);
        }
    };

    const onclickconfirmdelete = () => {
        // setDeleteRecordId(UpdateItem.Id);
        toggleHideDialog();
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            if (!!UpdateItem) {
                const processUpdateItem = (input: any) => {
                    if (Array.isArray(input)) {
                        return input.map(item => ({
                            Id: item.ID,
                            IsDeleted: true
                        }));
                    } else if (typeof input === 'object' && input !== null) {
                        return [{ Id: input.ID, IsDeleted: true }];
                    } else {
                        return [];
                    }
                };
                const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];
                items.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.Employee,
                        EntityId: res?.ID,
                        EntityName: `${res?.FirstName} ${res?.LastName}`,
                        Details: `Delete Employee`
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                });

                const newObjects = processUpdateItem(UpdateItem);
                const idsToDelete = newObjects.map(obj => obj.Id);

                if (newObjects.length > 0) {
                    await props.provider.updateListItemsInBatchPnP(ListNames.QuaycleanEmployee, newObjects)
                    setData((prevItems: any[]) => {
                        const tempData = prevItems.filter(item => !idsToDelete.includes(item.ID));
                        getSummary(tempData);
                        return tempData;
                    });
                }

                // _Data();
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };
    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };
    const _onSearchTextChangeForExcel = (data: any) => {
    };


    React.useEffect(() => {
        const filterList = () => {
            let filteredList = Data;
            if (filterType === "Total Employee") {
                filteredList = Data;
            } else if (filterType === "Inactive") {
                filteredList = Data.filter((item: any) => item.Inactive === true);
            } else if (filterType === "Active") {
                filteredList = Data.filter((item: any) => item.Inactive !== true);
            }
            if (selectedFirstName !== "") {
                filteredList = filteredList.filter((item: any) => item.FirstName === selectedFirstName);
            }
            if (selectedLastName !== "") {
                filteredList = filteredList.filter((item: any) => item.LastName === selectedLastName);
            }
            if (selectedEmail !== "") {
                filteredList = filteredList.filter((item: any) => item.Email === selectedEmail);
            }
            if (selectedPhone !== "") {
                filteredList = filteredList.filter((item: any) => item.Phone === selectedPhone);
            }
            // if (selectedState !== undefined && selectedState !== 0) {
            //     filteredList = filteredList.filter((item: any) =>
            //         item.StateId.includes(selectedState)
            //     );
            // }
            setFilteredData(filteredList);
        };

        setIsLoading(true);
        filterList();
        if (Data.length > 0) {
            setIsLoading(false);// Set filtered data to state
        }
    }, [Data, filterType, selectedFirstName, selectedLastName, selectedEmail, selectedPhone]);

    React.useEffect(() => {
        _Data();
        setIsLoading(true);
        setcolumnsEmployee([
            { key: 'EmployeeId', name: 'Employee Id', fieldName: 'EmployeeId', isResizable: true, minWidth: 60, maxWidth: 100, isSortingRequired: true },
            { key: 'FirstName', name: 'First Name', fieldName: 'FirstName', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: 'LastName', name: 'Last Name', fieldName: 'LastName', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            {
                key: 'State', name: 'State', fieldName: 'State', isResizable: true, minWidth: 280, maxWidth: 300, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.State) {
                        return (
                            <>
                                {item.State.map((name: any, index: any) => (
                                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                                ))}
                            </>
                        );
                    }
                },
            },
            {
                key: "Phone", name: 'Phone', fieldName: 'Phone', isResizable: true, minWidth: 80, maxWidth: 100,
                onRender: ((itemID: any) => {
                    return (
                        <>
                            <div>{formatPhoneNumber(itemID.Phone)}</div>
                        </>)
                })
            },
            { key: 'Email', name: 'Email', fieldName: 'Email', isResizable: true, minWidth: 280, maxWidth: 340, isSortingRequired: true },
            {
                key: "InActive", name: 'Inactive', fieldName: 'ID', Index: 2, isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((itemID: any) => {
                    return (
                        <>
                            <div className="dflex">
                                <Toggle
                                    label=""
                                    checked={itemID.Inactive} // Set the default checked state
                                    onChange={(e, checked) => onToggleChange(itemID, checked)} // Pass itemID and new state
                                />
                            </div>
                        </>)
                })
            },
            { key: 'IsQuaycleanUser', name: 'Quayclean User?', fieldName: 'IsQuaycleanUserValue', isResizable: true, minWidth: 80, maxWidth: 100, isSortingRequired: true },
        ]);
    }, [isRefreshGrid, selectedState]);

    const onClickYesCheckBox = async (): Promise<void> => {
        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = InActiveMessage.current === "Inactive" ? "Employee deactivated successfully!" : "Employee activated successfully!";
        let UpdateData = {
            Inactive: InActiveMessage.current == "Inactive" ? true : false
        }
        await props.provider.updateItemWithPnP(UpdateData, ListNames.QuaycleanEmployee, CheckBoxId.current);
        // setIsRefreshGrid(prevState => !prevState);
        toastService.updateLoadingWithSuccess(toastId, toastMessage);
        setData((prevItems: any) => {
            const tempData = prevItems.map((item: any) =>
                item.ID === CheckBoxId.current ? { ...item, Inactive: UpdateData.Inactive } : item
            );
            getSummary(tempData);
            return tempData;
        });


        // console.log(FilteredData);
        hidePopup4();
    };
    const _onItemInvoked = (item: any): void => {
        // _onclickDetailsView(item);
    };

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}
            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />

            <div className="boxCard">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Employee</h1>
                    </div>
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                        <div className="mt-15 mb--15">
                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager) &&
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                    <TabMenu
                                        stateMasterItems={currentUserRoleDetail.stateMasterItems}
                                        onStateChange={onTabStateChange} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <EmployeeCountCard data={SummaryData} handleCardClick={handleCardClick} />
                {Data.length > 0 &&
                    <div className="ms-Grid mt-15">
                        <div className="ms-Grid-row filtermrg">
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                                <div className="formControl">
                                    <AutoComplete
                                        type="First Name"
                                        option={empFirstNames}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                    {/* <FirstNameFilter
                                        selectedFirstName={selectedFirstName}
                                        defaultOption={selectedFirstName}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={true} onFirstNameChange={function (FirstNameId: string): void {
                                            throw new Error("Function not implemented.");
                                        }} /> */}
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                                <div className="formControl">
                                    <AutoComplete
                                        type="Last Name"
                                        option={empLastNames}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                                <div className="formControl">
                                    <AutoComplete
                                        type="Email"
                                        option={empEmails}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                                <div className="formControl">
                                    <AutoComplete
                                        type="Phone"
                                        option={empPhones}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>}
                <div className="formGroup mt-3">
                    {currentView === "grid" &&
                        <MemoizedDetailList
                            manageComponentView={props.manageComponentView}
                            columns={columnsEmployee}
                            items={FilteredData || []}
                            reRenderComponent={true}
                            CustomselectionMode={SelectionMode.multiple}
                            onSelectedItem={_onItemSelected}
                            searchable={true}
                            isAddNew={true}
                            onItemInvoked={_onItemInvoked}
                            _onSearchTextChangeForExcel={_onSearchTextChangeForExcel}
                            addEDButton={<>
                                <div className='dflex mb3px'>

                                    {isDisplayEDbtn && <>
                                        <div className='dflex'>
                                            {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                                <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="edit" />
                                                </TooltipHost>
                                            </Link>}
                                            <Link className="actionBtn iconSize btnDanger  ml-10" onClick={onclickconfirmdelete}>
                                                <TooltipHost content={"Delete"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="trash-alt" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    </>}
                                    <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={"Export to excel"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </>
                            }
                            addNewContent={
                                <>
                                    <div className="dflex pb-1">
                                        <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                            text="">
                                            <TooltipHost
                                                content={"Refresh Grid"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"arrows-rotate"}
                                                />
                                            </TooltipHost>    </Link>
                                        <PrimaryButton text="Add" className="btn btn-primary "
                                            onClick={() => {
                                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddEmployee, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddEmployee, isAddClient: true, breadCrumItems: breadCrumItems } });
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddEmployee, empIds: empIds, empEmails: empEmails, empPhones: empPhones, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });

                                            }}
                                        />
                                    </div>
                                </>
                            } />}
                </div>
            </div>
            {
                isPopupVisible4 && (
                    <Layer>
                        <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup4}>
                            <Overlay onClick={hidePopup4} />
                            <FocusTrapZone>
                                <Popup role="document" className={popupStyles.content}>
                                    <h2 className="mt-10">Confirmation</h2>
                                    <div className="mt-3">
                                        {InActiveMessage.current == "Inactive" ? "Are you sure you want to Inactive employee" : "Are you sure you want to Active employee"}</div>
                                    <DialogFooter>
                                        <PrimaryButton text="Yes" onClick={onClickYesCheckBox} className='mrt15 css-b62m3t-container btn btn-primary' />
                                        <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                                    </DialogFooter>
                                </Popup>
                            </FocusTrapZone>
                        </Popup>
                    </Layer>
                )
            }
        </>;
    }
};