/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { ActionMeta } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogFooter, DialogType, IconButton, Link, Modal, PrimaryButton, TextField, TooltipHost } from "office-ui-fabric-react";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { ListNames } from "../Common/Enum/ComponentNameEnum";
import { IDataProvider } from "../DataProvider/Interface/IDataProvider";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../DataProvider/Interface/IPnPQueryOptions";
import { regexemail, regexPhoneNumber } from "./Constants/CommonConstants";
import { Loader } from "../webparts/quayClean/components/CommonComponents/Loader";
import { cancelIcon, contentStyles, iconButtonStyles } from "./Constants/CommonStyleConstatnt";
import { ReactDropdown } from "../webparts/quayClean/components/CommonComponents/ReactDropdown";
import CamlBuilder from "camljs";
import moment from "moment";
import { ICamlQueryFilter, FieldType, LogicalType } from "./Constants/DocumentConstants";
import { getCAMLQueryFilterExpression } from "./Util";

interface IAddEmployeeProps {
    onEmployeeChange: (employeeId: any) => void;
    provider: IDataProvider;
    placeHolder?: string,
    isRequired?: boolean;
    defaultOption?: any;
    AllOption?: boolean;
    StateId: any;
    isDisabled: boolean;
    isCloseMenuOnSelect?: boolean;
    selectedAttendeeType: string | undefined;
    selectedAttendeeOptions: any[];
    isMultiselected?: boolean;
    dialogWidth?: any;
}
interface IEmployee {
    ID: number;
    Title: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Phone: string;
}



export const AddOtherEmployee: React.FunctionComponent<IAddEmployeeProps> = (props: IAddEmployeeProps): React.ReactElement => {

    const tooltipId = useId('tooltip');
    const [employeeOptions, setEmployeeOptions] = React.useState<any[]>([]);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [addedValues, setAddedValues] = React.useState<string[]>([]);
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const [newEmployeeList, setNewEmployeeList] = React.useState<IEmployee[]>([]);
    const [responseData, setresponseData] = React.useState<any[]>([]);
    const [validationDialog, { toggle: toggleValidationDialog }] = useBoolean(true);
    const [isLoading, { toggle: toggleLoading }] = useBoolean(false);
    const [selectedItem, setSelectedItem] = React.useState<IEmployee | undefined>(undefined);
    const contentStyle = contentStyles(window.innerWidth <= 768 ? '90%' : props.dialogWidth);
    let responseId = React.useRef<number>(0);
    let currentState = React.useRef<any>();
    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);


    const [objData, setObjData] = React.useState<{ firstName: string; lastName: string; email: string; phone: string }>({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const _onEmployeeChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        props.onEmployeeChange(selectedOptions);
    };

    const onClickAdd = (): void => {
        if (props.StateId) {
            setSelectedItem(undefined);
            showPopup();
        } else {
            setErrorMessages(['Please select Job Site!']);
            toggleValidationDialog();
        }

    };

    const onClickEdit = (item: any): void => {
        setObjData({
            firstName: item.FirstName,
            lastName: item.LastName,
            email: item.Email,
            phone: item.Phone
        });
        setSelectedItem(item);
        showPopup();
    };

    const onClickClose = (): void => {
        toggleLoading();
        setObjData({
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        })
        hidePopup();
    };

    const onChangeTitle = (event: any): void => {
        const { name, value } = event.target;
        setObjData({
            ...objData,
            [name]: value
        });
    };
    const validateInput = (): boolean => {
        const messages: string[] = [];
        let isValid = true;

        if (!(objData.firstName).trim()) {
            isValid = false;
            messages.push('First Name is required!');
        }
        if (!(objData.lastName).trim()) {
            isValid = false;
            messages.push('Last Name is required!');
        }
        if (!(objData.email).trim()) {
            isValid = false;
            messages.push('Email is required!');
        } else if (!regexemail.test(objData.email)) {
            isValid = false;
            messages.push('Email is not valid!');
        }

        if (!(objData.phone).trim()) {
            // isValid = false;
            // messages.push('Email is required!');
        } else if (!regexPhoneNumber.test(objData.phone)) {
            isValid = false;
            messages.push('Phone number is not valid!');
        }

        const emailExists = selectedItem
            ? addedValues.filter(email => email !== selectedItem.Email).includes(objData.email)
            : addedValues.includes(objData.email);
        const phoneExists = selectedItem
            ? addedValues.filter(phone => phone !== selectedItem.Phone).includes(objData.phone)
            : addedValues.includes(objData.phone);

        if (emailExists) {
            const matchedRecord = responseData.find(record => record.Email === objData.email);
            if (matchedRecord) {
                responseId.current = matchedRecord.ID;
                currentState.current = matchedRecord.StateId;
            } else {
                responseId.current = 0;
            }
        } else {
            responseId.current = 0;
        }

        setErrorMessages(messages);
        return isValid;
    };

    const onClickSave = async (evt: { preventDefault: () => void; }) => {
        try {

            let isValid = validateInput();

            if (!isValid) {
                toggleValidationDialog();
                return;
            } else {
                toggleLoading();
                let drpOption = [...props.selectedAttendeeOptions];
                const fullName = `${(objData.firstName).trim()} ${(objData.lastName).trim()}`;

                if (!!currentState.current && !currentState.current.includes(props.StateId)) {
                    currentState.current.push(props.StateId);
                }

                // Remove duplicates by creating a unique array from `currentState.current`
                const uniqueStateIds = Array.from(new Set(currentState.current));

                const data = {
                    Title: fullName,
                    FirstName: objData.firstName.trim(),
                    LastName: objData.lastName.trim(),
                    Email: objData.email.trim(),
                    Phone: objData.phone.trim(),
                    StateId: uniqueStateIds?.length > 0 ? uniqueStateIds : [props.StateId]
                };
                const statedata = {
                    Title: fullName,
                    FirstName: objData.firstName.trim(),
                    LastName: objData.lastName.trim(),
                    StateId: uniqueStateIds?.length > 0 ? uniqueStateIds : [props.StateId]
                };
                try {
                    if (responseId.current > 0) {
                        let updatedEmployee = await props.provider.updateItemWithPnP(statedata, ListNames.QuaycleanEmployee, responseId.current);
                        setNewEmployeeList(prevList => [
                            ...prevList,
                            {
                                ID: responseId.current,
                                Title: updatedEmployee.Title,
                                FirstName: updatedEmployee.FirstName,
                                LastName: updatedEmployee.LastName,
                                Email: objData.email,
                                Phone: objData.phone,
                            }
                        ]);

                        updatedEmployee = {
                            ...updatedEmployee,
                            ID: responseId.current,
                        };

                        drpOption.push({ value: responseId.current, key: responseId.current, text: updatedEmployee.Title, label: updatedEmployee.Title });
                    } else {
                        if (!selectedItem) {
                            const newEmployee = await props.provider.createItem(data, ListNames.QuaycleanEmployee);
                            setNewEmployeeList(prevList => [
                                ...prevList,
                                {
                                    ID: newEmployee.data.Id,
                                    Title: newEmployee.data.Title,
                                    FirstName: newEmployee.data.FirstName,
                                    LastName: newEmployee.data.LastName,
                                    Email: newEmployee.data.Email,
                                    Phone: newEmployee.data.Phone,
                                }
                            ]);
                            drpOption.push({ value: newEmployee.data.Id, key: newEmployee.data.Id, text: newEmployee.data.Title, label: newEmployee.data.Title });
                        } else {
                            let updatedEmployee = await props.provider.updateItemWithPnP(data, ListNames.QuaycleanEmployee, selectedItem.ID);
                            updatedEmployee = {
                                ...updatedEmployee,
                                ID: selectedItem.ID,
                            };
                            const index = drpOption.findIndex(option => option.value === selectedItem.ID);
                            if (index !== -1) {
                                drpOption[index] = {
                                    value: updatedEmployee.ID,
                                    key: updatedEmployee.ID,
                                    text: updatedEmployee.Title,
                                    label: updatedEmployee.Title,
                                };
                            }
                            setNewEmployeeList(prevList => prevList.map(emp => emp.ID === selectedItem.ID ? updatedEmployee : emp));
                            // drpOption.push({ value: updatedEmployee.ID, key: updatedEmployee.ID, text: updatedEmployee.Title, label: updatedEmployee.Title });
                        }
                    }
                    responseId.current = 0;
                    onClickClose();
                    getQuaycleanEmployeeList();
                    // setDefaultvalue(drpOption);
                    props.onEmployeeChange(drpOption);
                } catch (err) {
                    console.error(err);
                }
            }

        } catch (error) {
            console.log(error);
        }
    };

    // const _InspectionData = async () => {
    //     try {


    //         if (!!results) {
    //             const ListData = results.map((data: any) => {
    //                 return {
    //                     ID: data.ID,
    //                     Title: data.Title,
    //                     DocNumber: !!data.DocNumber ? data.DocNumber : '',
    //                     SiteNameId: !!data.SiteName ? data.SiteName[0]?.lookupId : '',
    //                     SiteName: !!data?.SiteName ? data.SiteName[0]?.lookupValue : '',
    //                     Score: !!data.Score ? data.Score : '',
    //                     Owner: !!data.Owner ? data.Owner : '',
    //                     srtCompleted: !!data.Completed ? moment(data.Completed).format('YYYY-MM-DD') : '9999-12-31', // Format for sorting
    //                     srtConductedon: !!data.Conductedon ? moment(data.Conductedon).format('YYYY-MM-DD') : '',
    //                     Conductedon: !!data.Conductedon ? moment(data.Conductedon).format('DD MMM YYYY') : '',
    //                     Created: !!data.Created ? moment(data.Created).format('DD MMM YYYY HH:MM A') : '',
    //                     Modified: !!data.Modified ? moment(data.Modified).format('DD MMM YYYY HH:MM A') : '',
    //                     Completed: !!data.Completed ? moment(data.Completed).format('DD MMM YYYY') : '31 Dec 9999',
    //                     InspectionTitle: !!data.InspectionTitle ? data.InspectionTitle : '',
    //                     TemplateName: !!data.TemplateName ? data.TemplateName : '',
    //                     TemplateId: !!data.TemplateId ? data.TemplateId : '',
    //                     WebReportURL: !!data.WebReportURL ? data.WebReportURL : '',
    //                     Status: !!data.Status ? data.Status : '',
    //                     Location: !!data.Location ? data.Location : '',
    //                     ItemsCompleted: !!data.ItemsCompleted ? data.ItemsCompleted : '',
    //                     LastEditor: !!data.Editor ? data.Editor.Title : ""
    //                 };
    //             });

    //             let filteredData: any[];
    //             if (currentUserRoleDetail?.isAdmin) {
    //                 filteredData = ListData;
    //             } else {
    //                 let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
    //                 filteredData = !!ListData && ListData?.filter((item: any) =>
    //                     AllSiteIds.includes(item?.SiteNameId)
    //                 );
    //             }
    //             // filteredData = filteredData?.sort((a: any, b: any) => {
    //             //     return moment(b.Modified).diff(moment(a.Modified));
    //             // });
    //             setIsLoading(false);
    //             return filteredData;
    //         }
    //         return [];
    //     } catch (error) {
    //         console.log(error);
    //         setIsLoading(false);
    //     }
    // };

    const getQuaycleanEmployeeList = async (): Promise<void> => {
        let dropvalue: any = [];
        const label = `-- All --`;
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: label });
        }
        const camlQuery = new CamlBuilder()
            .View([
                "Id",
                "FirstName",
                "LastName",
                "StateId",
                "State",
                "Email",
                "Phone",
                "IsDeleted"
            ])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();

        const filterFields: ICamlQueryFilter[] = [
            {
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            },
            {
                fieldName: "Inactive",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            }];

        const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
        camlQuery.Where().All(categoriesExpressions);
        const pnpQueryOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.QuaycleanEmployee,
            queryXML: camlQuery.ToString(),
            pageToken: "",
            pageLength: 100000
        }
        const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
        const results = localResponse?.Row;

        // const select = ["Id,FirstName,LastName,StateId,StateId/Title,Email,Phone"];
        // const expand = ["State"];
        // let filter;
        // filter = `IsDeleted ne 1`;
        // const queryStringOptions: IPnPQueryOptions = {
        //     select: select,
        //     expand: expand,
        //     filter: filter,
        //     listName: ListNames.QuaycleanEmployee
        // };
        // props.provider.getItemsByQuery(queryStringOptions).then((response) => {
        const emailArray = results.map((item: any) => item.Email);
        const res = results.map((items: any) => items);
        setresponseData(res);
        setAddedValues(emailArray);
        // let employeeList = results.filter((data: any) => data.StateId.includes(props.StateId));
        let employeeList = results.filter((data: any) =>
            data.State.some((state: any) => state.lookupId === props.StateId)
        );

        employeeList.map((Employee: any) => {
            let FullName = Employee.FirstName + " " + Employee.LastName;
            dropvalue.push({ value: Number(Employee.ID), key: Number(Employee.ID), text: FullName, label: FullName });
        });
        setEmployeeOptions(dropvalue);
        // }).catch((error) => {
        //     console.log(error);
        // });
    };

    React.useEffect(() => {
        getQuaycleanEmployeeList();
        setNewEmployeeList([]);
    }, [props.StateId]);


    return <>
        {isLoading && <Loader />}
        <Modal
            titleAriaId={"titleId"}
            isOpen={isPopupVisible}
            onDismiss={() => hidePopup()}
            isBlocking={false}
            isModeless={true}
            isDarkOverlay={true}
            containerClassName={contentStyle.container}
        >
            <div className={contentStyle.header}>
                <h2 className={contentStyle.heading} id={"titleId"}>
                    {selectedItem ? 'Update Attendee' : 'Add Attendee'}
                </h2>
                <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => hidePopup()}
                />
            </div>
            <div className={contentStyle.body}>
                <p>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row mt-10">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <TextField
                                    name="firstName"
                                    label='First Name'
                                    placeholder="Enter First Name"
                                    value={objData?.firstName}
                                    required
                                    onChange={onChangeTitle} />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <TextField
                                    name="lastName"
                                    label='Last Name'
                                    placeholder="Enter Last Name"
                                    value={objData?.lastName}
                                    required
                                    onChange={onChangeTitle} />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <TextField
                                    name="email"
                                    label='Email'
                                    placeholder="Enter Email"
                                    value={objData?.email}
                                    required
                                    onChange={onChangeTitle} />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <TextField
                                    name="phone"
                                    label='Phone Number'
                                    placeholder="Enter Phone Number"
                                    value={objData?.phone}
                                    onChange={onChangeTitle} />
                            </div>
                        </div>

                    </div>
                </p>
                <p>
                    <div className="d-flex justifyright customButton">
                        <TooltipHost content="Add" id={"toolTipUpdate"}>
                            <PrimaryButton text={`${selectedItem ? "Update" : "Add"}`} className="btn-primary"
                                onClick={onClickSave} />&nbsp;&nbsp;
                        </TooltipHost>
                        <TooltipHost content="Cancel" id={"CancelonDialog"}>
                            <PrimaryButton text="Cancel" className="btn-danger" onClick={() => { toggleLoading(); onClickClose() }} />
                        </TooltipHost>
                    </div>
                </p>
            </div>
        </Modal>

        <div>
            {props.selectedAttendeeType === 'Other Employee' && <div className="ttadd-10 mt-2">
                {(props.AllOption == false || props.AllOption == undefined) &&

                    <Link className="actionBtn btnInfo dticon" onClick={onClickAdd}>
                        <TooltipHost content={"Plus"} id={tooltipId}>
                            <FontAwesomeIcon icon="plus" />
                        </TooltipHost>
                    </Link>}
            </div>}

            <div>
                <ReactDropdown
                    isMultiSelect={props.isMultiselected || true}
                    options={employeeOptions}
                    placeholder={props.placeHolder}
                    defaultOption={props.defaultOption}
                    onChange={_onEmployeeChange}
                    isDisabled={props.isDisabled ? props.isDisabled : false}
                    isCloseMenuOnSelect={(props?.isCloseMenuOnSelect == undefined) ? true : props?.isCloseMenuOnSelect}
                />
            </div>
            <div className="mt-2">
                {(newEmployeeList.length > 0) && <>
                    {newEmployeeList.map((item: any) => {
                        return (
                            <div style={{ display: 'flex', gap: '2px', wordBreak: 'break-word' }}>{item.Email}
                                <Link className="actionBtn btnMoving dticon" onClick={() => { onClickEdit(item) }}>
                                    <TooltipHost content={"Edit"} id={tooltipId}>
                                        <FontAwesomeIcon icon="edit" />
                                    </TooltipHost>
                                </Link>
                            </div>
                        )
                    })}

                </>
                }
            </div>
        </div>
        <Dialog
            hidden={validationDialog}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Validation Failed',
                closeButtonAriaLabel: "Ok",
            }}
            modalProps={{
                titleAriaId: "successTitle",
                subtitleAriaId: "subTitleAreaId",
                className: 'addDiaglog'
            }}
        >
            {errorMessages.length > 0 &&
                <ul>
                    {errorMessages.map((vm: any) => <li className="msg" key={vm}>{vm}</li>)}
                </ul>
            }
            <DialogFooter>
                <PrimaryButton onClick={(e: any) =>
                    toggleValidationDialog()}
                    text="Ok" />
            </DialogFooter>
        </Dialog>
    </>;

};