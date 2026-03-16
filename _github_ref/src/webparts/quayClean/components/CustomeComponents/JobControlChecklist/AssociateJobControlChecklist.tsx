import { PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { toastService } from "../../../../../Common/ToastService";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getStateBySiteId, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');

interface OutputDataItem {
    frequency: string;
    status: string;
}


export const AssociateJobControlChecklist = (props: IHelpDeskFormProps) => {
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [QuestionData, setQuestionData] = React.useState<any[]>([]);
    const [options, setOptions] = React.useState([]);
    const [options2, setOptions2] = React.useState([]);
    let BatchData = React.useRef<any>();
    let HistoryData = React.useRef<any>();
    let MasterData = React.useRef<any>();
    let UpdateBatchData = React.useRef<any>();
    let UpdateHistoryData = React.useRef<any>();
    const [isCompletedUpdate, setisCompletedUpdate] = React.useState<boolean>(false);
    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const [oldValues, setoldValues] = React.useState<any>({});
    const [selectedDropdownValues, setSelectedDropdownValues] = React.useState<any>({});

    const findNonMatchingData = (mainData: any, changeData: any) => {
        return Object.keys(changeData).filter(key => {
            return (
                !mainData[key] ||
                mainData[key].frequency !== changeData[key].frequency ||
                mainData[key].status !== changeData[key].status
            );
        }).map(key => ({
            key,
            ...changeData[key]
        }));
    };

    const createComparisonData = (nonMatchingData: any, oldValues: any) => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currentMonth = monthNames[new Date().getMonth()]; // e.g., "August"
        const currentYear = new Date().getFullYear(); // e.g., 2024
        return nonMatchingData.map((item: any) => {
            const previousData = oldValues[item.key] || {};
            return {
                QuestionId: Number(previousData.QuestionId),
                PreviousFrequency: previousData.frequency,
                CurrentFrequency: item.frequency,
                PreviousStatus: previousData.status,
                CurrentStatus: item.status,
                Month: currentMonth,
                Year: currentYear.toString(),
                SiteNameId: props?.originalSiteMasterId
            };
        });
    };

    React.useEffect(() => {
        const nonMatchingData = findNonMatchingData(oldValues, selectedDropdownValues);
        let isCompleted = false;
        const dataValues = Object.values(selectedDropdownValues);
        const allNonCheckedStatus = dataValues.every((record: any) => record.status !== "Not Yet Checked");

        if (allNonCheckedStatus) {
            isCompleted = true;
            setisCompletedUpdate(true);
        } else {
            setisCompletedUpdate(false);
        }

        UpdateBatchData.current = nonMatchingData;
        const comparisonData = createComparisonData(nonMatchingData, oldValues);
        UpdateHistoryData.current = comparisonData;
    }, [selectedDropdownValues]);

    React.useEffect(() => {
        if (QuestionData.length > 0) {
            let selectedDDValues = QuestionData.reduce((acc: any, question: any) => {
                acc[question.ID] = { frequency: question.Frequency, status: question.Status ? question.Status : "Not Yet Checked", QuestionId: question?.QuestionId ? question?.QuestionId : "" };
                return acc;
            }, {});
            let flag = true;
            if (flag === true) {
                setoldValues(selectedDDValues);
                flag = false;
            }
            setSelectedDropdownValues(selectedDDValues);
        }
    }, [QuestionData]);

    React.useEffect(() => {
        const transformedData = Object.entries(selectedDropdownValues).map(([questionId, data]: [string, OutputDataItem]) => ({
            Frequency: data.frequency,
            Status: data.status,
            QuestionId: parseInt(questionId, 10) // Convert questionId to number
        }));
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currentMonth = monthNames[new Date().getMonth()]; // e.g., "August"
        const currentYear = new Date().getFullYear(); // e.g., 2024

        // Add month and year to each object
        const updatedData = transformedData.map(item => ({
            ...item,
            Month: currentMonth,
            Year: currentYear.toString(),
            SiteNameId: props?.originalSiteMasterId
        }));
        BatchData.current = updatedData;

        let Completed = false;
        // Check if all records have a Status other than "Not Yet Checked"
        const allNonCheckedStatus = updatedData.every(record => record.Status !== "Not Yet Checked");

        if (allNonCheckedStatus) {
            Completed = true;
        } else {
            Completed = false;
        }

        const historyData = Object.entries(selectedDropdownValues).map(([questionId, data]: [string, OutputDataItem]) => ({
            CurrentFrequency: data.frequency,
            CurrentStatus: data.status,
            QuestionId: parseInt(questionId, 10) // Convert questionId to number
        }));
        const updatedHistoryData = historyData.map(item => ({
            ...item,
            Month: currentMonth,
            Year: currentYear.toString(),
            SiteNameId: props?.originalSiteMasterId
        }));
        HistoryData.current = updatedHistoryData;

        if (Completed === true) {
            const MasterDatas: any = {
                SiteNameId: props?.originalSiteMasterId,
                Month: currentMonth,
                Year: currentYear.toString(),
                IsCompleted: true
            };
            MasterData.current = MasterDatas;
        } else {
            const MasterDatas: any = {
                SiteNameId: props?.originalSiteMasterId,
                Month: currentMonth,
                Year: currentYear.toString()
            };
            MasterData.current = MasterDatas;
        }

    }, [selectedDropdownValues]);

    const onClickAssignedQuestion = () => {

    }

    const _QuestionData = () => {
        setIsLoading(true);
        const select = ["ID,Title,SiteNameId,Frequency,Index,SiteName/Title,IsEdited,JCCId"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: ['SiteName'],
            listName: ListNames.JobControlChecklistQuestion,
            filter: `SiteNameId eq '${props.originalSiteMasterId}' and IsEdited eq 1`
        };
        props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                const EditItem = results.map((data) => {
                    return (
                        {
                            // ID: data.ID,
                            ID: !!data.JCCId ? data.JCCId : data.ID,
                            Title: data.Title,
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                            Frequency: !!data.Frequency ? data.Frequency : '',
                            IsEdited: data.IsEdited,
                            Index: !!data.Index ? data.Index : 0,
                            Modified: !!data.Modified ? data.Modified : null,
                            SiteName: !!data.SiteNameId ? data.SiteName.Title : '',
                            JCC: !!data.JCCId ? data.JCCId : null,
                        }
                    );
                });

                if (!!EditItem && EditItem.length > 0) {
                    setQuestionData(EditItem);
                    setIsLoading(false);
                } else {

                    try {
                        const select = ["ID,Title,Frequency,Index"];
                        const queryStringOptions: IPnPQueryOptions = {
                            select: select,
                            listName: ListNames.JobControlChecklist,
                        };

                        props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                            if (!!results) {
                                const UsersListData = results.map((data) => {
                                    return (
                                        {
                                            ID: data.ID,
                                            Title: data.Title,
                                            Index: !!data.Index ? data.Index : '',
                                            Frequency: !!data.Frequency ? data.Frequency : ''
                                        }
                                    );
                                });
                                setQuestionData(UsersListData);
                                setIsLoading(false);
                            }
                        }).catch((error) => {
                            console.log(error);
                            setIsLoading(false);
                        });
                    } catch (ex) {
                        console.log(ex);
                        setIsLoading(false);
                    }

                }
            }
        }).catch((error: any) => {
            console.log(error);
        });



    };

    const _QuestionDetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,QuestionId,Question/Title,Frequency,Status,Month,Year,SiteNameId"];
            const expand = ["Question"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: `Month eq '${props?.componentProps?.Month}' and Year eq '${props?.componentProps?.Year}' and SiteNameId eq '${props?.originalSiteMasterId}'`,
                listName: ListNames.JobControlChecklistDetails,
            };

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Question ? data.Question?.Title : '',
                                QuestionId: data?.QuestionId,
                                Frequency: !!data.Frequency ? data.Frequency : '',
                                Question: !!data.Question ? data.Question?.Title : '',
                                Status: !!data.Status ? data.Status : 'Not Yet Checked',
                                Month: !!data.Month ? data.Month : '',
                                Year: !!data.Year ? data.Year : '',
                                MonthYear: !!data.Month ? data.Month + "-" + data.Year : '',
                            }
                        );
                    });
                    setQuestionData(UsersListData);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };
    const onClickClose = () => {
        // if (props?.componentProps?.dataObj) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.dataObj?.QCStateId, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: StateName, pivotName: "ViewJobControlChecklistKey"
        //     });
        // } 
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "ViewJobControlChecklistKey",
                subpivotName: "SiteKPIs"
            });
        }
        else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.originalState, pivotName: "ViewJobControlChecklistKey", subpivotName: "SiteKPIs"
            });
        }
    };

    const onClickSaveOrUpdate = async () => {
        let UpdateIdMaster: number = 0;
        setIsLoading(true);

        if (!!props?.siteMasterId && props?.siteMasterId > 0) {
            setIsLoading(true);

            try {
                const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                const currentMonth = monthNames[new Date().getMonth()];
                const currentYear = new Date().getFullYear();
                const Year = currentYear.toString();
                const select = ["ID,Month,Year,SiteNameId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `Month eq '${currentMonth}' and Year eq '${Year}' and SiteNameId eq '${props?.originalSiteMasterId}'`,
                    listName: ListNames.JobControlChecklistMaster,
                };

                try {
                    const results = await props.provider.getItemsByQuery(queryStringOptions);
                    if (!!results && results.length > 0) {
                        UpdateIdMaster = results[0]?.ID;
                    }
                } catch (error) {
                    console.log(error);
                    const errorObj = {
                        ErrorMethodName: "_QuestionMaster",
                        CustomErrormessage: "Error in get Question Master",
                        ErrorMessage: error.toString(),
                        ErrorStackTrace: "",
                        PageName: "QuayClean.aspx",
                    };
                    await logGenerator(props.provider, errorObj);
                    setIsLoading(false);
                    return; // Exit the function if there is an error
                }
            } catch (ex) {
                console.log(ex);
                const errorObj = {
                    ErrorMethodName: "_QuestionMaster",
                    CustomErrormessage: "Error in get Question Master",
                    ErrorMessage: ex.toString(),
                    ErrorStackTrace: "",
                    PageName: "QuayClean.aspx",
                };
                await logGenerator(props.provider, errorObj);
                setIsLoading(false);
                return; // Exit the function if there is an error
            }

            const toastMessage = 'Update successfully!';
            const toastId = toastService.loading('Loading...');

            try {
                // Update all items in UpdateBatchData
                await Promise.all(
                    UpdateBatchData.current.map(async (item: any) => {
                        let updateId = item?.key;
                        let updateObj = {
                            Frequency: item?.frequency,
                            Status: item?.status,
                        };
                        await props.provider.updateItemWithPnP(updateObj, ListNames.JobControlChecklistDetails, Number(updateId));
                    })
                );
                const stateId = await getStateBySiteId(props.provider, Number(props.originalSiteMasterId));
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: Number(props.originalSiteMasterId),
                    ActionType: UserActivityActionTypeEnum.Update,
                    EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                    // EntityId: Number(createdId),
                    StateId: stateId,
                    EntityName: `${MasterData?.current?.Month} ${MasterData?.current?.Year}`,
                    Details: `Update Job Control Checklist`
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                let updateCompletedObj = {
                    IsCompleted: true
                };

                if (UpdateIdMaster > 0 && isCompletedUpdate) {
                    await props.provider.updateItemWithPnP(updateCompletedObj, ListNames.JobControlChecklistMaster, UpdateIdMaster);
                }

                await props.provider.createItemInBatch(UpdateHistoryData.current, ListNames.JobControlChecklistHistory);

                toastService.updateLoadingWithSuccess(toastId, toastMessage);
            } catch (err) {
                console.log(err);
                setIsLoading(false);
                return; // Exit the function if there is an error
            }

            setIsLoading(false);
            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            // props.manageComponentView({
            //     currentComponentName: ComponentNameEnum.AddNewSite,
            //     dataObj: props.componentProps.dataObj,
            //     breadCrumItems: breadCrumItems,
            //     siteMasterId: props.originalSiteMasterId,
            //     isShowDetailOnly: true,
            //     siteName: props.componentProps.siteName,
            //     qCState: props.componentProps.originalState,
            //     pivotName: "ViewJobControlChecklistKey",
            //     subpivotName: "SiteKPIs"
            // });
            onClickClose();
        } else {
            const toastMessage = 'Insert successfully!';
            const toastId = toastService.loading('Loading...');

            try {
                await Promise.all([
                    props.provider.createItemInBatch(BatchData.current, ListNames.JobControlChecklistDetails),
                    props.provider.createItem(MasterData.current, ListNames.JobControlChecklistMaster),
                    props.provider.createItemInBatch(HistoryData.current, ListNames.JobControlChecklistHistory),
                ]);
                // let createdId = res.data.Id;
                const stateId = await getStateBySiteId(props.provider, Number(props.originalSiteMasterId));
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: Number(props.originalSiteMasterId),
                    ActionType: UserActivityActionTypeEnum.Create,
                    EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                    // EntityId: Number(createdId),
                    StateId: stateId,
                    EntityName: `${MasterData?.current?.Month} ${MasterData?.current?.Year}`,
                    Details: `Add Job Control Checklist`
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                toastService.updateLoadingWithSuccess(toastId, toastMessage);
            } catch (err) {
                console.log(err);
                setIsLoading(false);
                return; // Exit the function if there is an error
            }

            setTimeout(() => {
                setIsLoading(false);
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // props.manageComponentView({
                //     currentComponentName: ComponentNameEnum.AddNewSite,
                //     dataObj: props.componentProps.dataObj,
                //     breadCrumItems: breadCrumItems,
                //     siteMasterId: props.originalSiteMasterId,
                //     isShowDetailOnly: true,
                //     siteName: props.componentProps.siteName,
                //     qCState: props.componentProps.originalState,
                //     pivotName: "ViewJobControlChecklistKey",
                //     subpivotName: "SiteKPIs"
                // });
                onClickClose();
            }, 1000);
        }
    };

    const getOptionList = (): void => {
        let dropvalue: any = [];
        props.provider.choiceOption(ListNames.JobControlChecklistDetails, "Status").then((response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });

            // Ensure "Not Yet Checked" is at the start of the array
            const notYetChecked = dropvalue.find((item: any) => item.value === "Not Yet Checked");
            if (notYetChecked) {
                dropvalue = [
                    notYetChecked, // Place "Not Yet Checked" first
                    ...dropvalue.filter((item: any) => item.value !== "Not Yet Checked") // Filter out "Not Yet Checked" from the rest
                ];
            }

            setOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    const getOptionList2 = (): void => {
        let dropvalue: any = [];
        props.provider.choiceOption(ListNames.JobControlChecklist, "Frequency").then((response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });
            setOptions2(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    const onOptionChange = (option: any, questionId: number) => {
        setSelectedDropdownValues((prevState: any) => ({
            ...prevState,
            [questionId]: {
                ...prevState[questionId],
                status: option.value // Storing 'status' dropdown value
            }
        }));
    };

    const onOptionChange2 = (option: any, questionId: number) => {
        setSelectedDropdownValues((prevState: any) => ({
            ...prevState,
            [questionId]: {
                ...prevState[questionId],
                frequency: option.value // Storing 'frequency' dropdown value
            }
        }));
    };

    React.useEffect(() => {
        getOptionList();
        getOptionList2();
        if ((!!props?.siteMasterId && props?.siteMasterId > 0) || (props?.componentProps?.Month && props?.componentProps?.Year)) {
            _QuestionDetailsData();
        } else {
            _QuestionData();
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
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div>

                            <div className="asset-card-2-header">
                                <div className="card-jcc-header dflex justify-content-between align-items-center">
                                    <div className="dflex align-items-center">
                                        <img src={imgLogo} height="90px" width="90px" className="course-img-first" />
                                        <h2 className="card-header-head" style={{ marginLeft: '10px' }}>Site KPI's</h2>
                                    </div>
                                    <PrimaryButton
                                        style={{ marginBottom: "5px", marginTop: "10px" }}
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={onClickClose}
                                    />
                                </div>
                            </div>

                            {QuestionData.map((question: any) => (
                                <div className="asset-card-2 keep-together" key={question.ID}>
                                    <div className="card-jcc">
                                        <div className="textfield-container-jcc">
                                            {question.Title}
                                        </div>
                                        <div className="dropdown-container-jcc-2">
                                            <div className="dropdown-jcc-2">
                                                <ReactDropdown
                                                    options={options2}
                                                    isMultiSelect={false}
                                                    defaultOption={selectedDropdownValues[question.ID]?.frequency || question.Frequency}
                                                    onChange={(option) => onOptionChange2(option, question.ID)}
                                                    placeholder={"Frequency"}
                                                />
                                            </div>
                                            <div className="dropdown-jcc-2">
                                                <ReactDropdown
                                                    options={options}
                                                    isMultiSelect={false}
                                                    isSorted={false}
                                                    defaultOption={selectedDropdownValues[question.ID]?.status || question.Status}
                                                    onChange={(option) => onOptionChange(option, question.ID)}
                                                    placeholder={"Status"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="asset-card-2-btn">
                            <div className="card-btn-width">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 justify-lg-right">
                                    <PrimaryButton
                                        style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                        className="btn btn-primary"
                                        text={state.isAddNewHelpDesk ? 'Save' : "Update"}
                                        onClick={onClickSaveOrUpdate}
                                    />
                                    <PrimaryButton
                                        style={{ marginBottom: "5px", marginTop: "10px" }}
                                        className="btn btn-danger"
                                        text="Cancel"
                                        onClick={onClickClose}
                                    />
                                </div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    </>;

};