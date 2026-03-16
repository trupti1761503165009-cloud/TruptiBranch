/* eslint-disable @typescript-eslint/no-use-before-define */
import { Dropdown, DropdownMenuItemType, IDropdownOption, Label, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { logGenerator, removeElementOfBreadCrum, generateAndSaveKendoPDF, UserActivityLog, getStateBySiteId } from "../../../../../Common/Util";
import { YearFilter } from "../../../../../Common/Filter/YearFilter";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../Common/ToastService";
import { useBoolean } from "@fluentui/react-hooks";
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { useAtomValue } from "jotai";
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');

export const PDFViewJobControlChecklist = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [QuestionData, setQuestionData] = React.useState<any[]>([]);
    const [QuestionDetailsData, setQuestionDetailsData] = React.useState<any[]>([]);
    const [DetailData, setDetailData] = React.useState<any[]>([]);
    const [Year, setYear] = React.useState<string>("");
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>();
    const [selectedYear, setSelectedYear] = React.useState<any>();
    const [defaultMonth, setdefaultMonth] = React.useState<any>("");
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);

    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

    const monthOptions: IDropdownOption[] = [
        { key: 'all', text: 'All', itemType: DropdownMenuItemType.Normal },
        { key: 'january', text: 'January' },
        { key: 'february', text: 'February' },
        { key: 'march', text: 'March' },
        { key: 'april', text: 'April' },
        { key: 'may', text: 'May' },
        { key: 'june', text: 'June' },
        { key: 'july', text: 'July' },
        { key: 'august', text: 'August' },
        { key: 'september', text: 'September' },
        { key: 'october', text: 'October' },
        { key: 'november', text: 'November' },
        { key: 'december', text: 'December' },
    ];

    const getMonthKey = (month: string): string => {
        const monthLowerCase = month.toLowerCase();
        return monthLowerCase;
    };

    const onclickSendEmail = () => {
        showPopup();
    };

    const defaultMonthKey = getMonthKey(defaultMonth);

    React.useEffect(() => {
        setSelectedKeys([defaultMonthKey]);
    }, [defaultMonthKey]);

    React.useEffect(() => {
        if (DetailData.length > 0) {

            const Keys = selectedKeys.map(month => month.toLowerCase());
            const FilterData = DetailData.filter(item =>
                Keys.includes(item.Month.toLowerCase()) && item.Year === selectedYear
            );
            setQuestionDetailsData(FilterData);
        }
    }, [DetailData, selectedKeys, selectedYear]);



    const onChange = (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ): void => {
        if (option) {
            if (option.key === 'all') {
                if (option.selected) {
                    setSelectedKeys(monthOptions.map((month) => month.key as string));
                } else {
                    setSelectedKeys([]);
                }
            } else {
                const newSelectedKeys = option.selected
                    ? [...selectedKeys, option.key as string]
                    : selectedKeys.filter((key) => key !== option.key);
                if (newSelectedKeys.length === monthOptions.length - 1) {
                    setSelectedKeys(monthOptions.map((month) => month.key as string));
                } else {
                    setSelectedKeys(newSelectedKeys.filter((key) => key !== 'all'));
                }
            }
        }
    };
    const onYearChange = (Year: any): void => {
        setSelectedYear(Year.text);
    };

    const onClickClose = () => {
        // if (props?.componentProps?.dataObj) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.dataObj?.QCStateId, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: StateName, pivotName: "ViewJobControlChecklistKey", subpivotName: "SiteKPIs"
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
            manageComponentView({ currentComponentName: ComponentNameEnum.ViewJobControlChecklist, breadCrumItems: breadCrumItems, subpivotName: "SiteKPIs" });
        }
    };

    React.useEffect(() => {
        const lastYear = new Date().getFullYear() - 1;
        const Year = lastYear.toString();

        // const currentYear = new Date().getFullYear();
        // const Year = currentYear.toString();
        setYear(Year);
        setSelectedYear(Year);
    }, [QuestionData]);

    const _QuestionData = () => {
        setIsLoading(true);
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
                    let QuestionIdArray = UsersListData.map((item: any) => item.ID);
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

    const onClickCancel = (): void => {
        resetForm();
        hidePopup();
    };

    const resetForm = (): void => {
        setTitle("");
        setSendToEmail("");
        setDisplayErrorTitle(false);
        setDisplayErrorEmail(false);
        setDisplayError(false);
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
    };

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSendToEmail(newValue || "");
        if (newValue) {
            setDisplayErrorEmail(false);
            setDisplayErrorEmail(false);
        }

        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        if (!enteredValue || emailPattern.test(enteredValue)) {
            setDisplayError(false);
        } else {
            setDisplayError(true);
        }
    };

    const onClickDownload = async (): Promise<void> => {
        let fileblob: any = await generateAndSaveKendoPDF("pdfJCC", `${SiteName} - Site KPI's`, false, true);
    };

    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            const fileName = `${SiteName} Site KPI's`;
            let fileblob: any = await generateAndSaveKendoPDF("pdfJCC", fileName, false);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}.pdf`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                StateName: StateName,
                SiteName: SiteName,
                EmailType: "JobControlChecklist"
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(async () => {
                    console.log("Upload Success");
                    const stateId = await getStateBySiteId(props.provider, Number(props.originalSiteMasterId));
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.originalSiteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Monthly KPI's to ${sendToEmail}`,
                        StateId: stateId || props?.componentProps?.dataObj?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                }).catch(err => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickCancel();
                setIsLoading(false);
            }).catch(err => console.log(err));
        } else {
            setIsLoading(false);
        }
    };

    const _QuestionDetailsData = () => {
        setIsLoading(true);
        try {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const currentDate = new Date();
            const currentMonthIndex = currentDate.getMonth(); const previousMonthIndex = (currentMonthIndex + 11) % 12;
            const currentMonth = monthNames[currentMonthIndex];
            const previousMonth = monthNames[previousMonthIndex];
            const currentYear = new Date().getFullYear();
            const Year = currentYear.toString();

            const select = ["ID,QuestionId,Question/Title,Frequency,Status,Month,Year,SiteNameId"];
            const expand = ["Question"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: !!props?.originalSiteMasterId ? `SiteNameId eq '${props?.originalSiteMasterId}'` : "",
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
                    const defaultMonth = determineDefaultMonth(UsersListData, currentMonth, previousMonth, Year);
                    setdefaultMonth(defaultMonth);
                    setDetailData(UsersListData);


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

    const determineDefaultMonth = (data: any[], currentMonth: string, previousMonth: string, year: string) => {
        const recordsForCurrentMonth = data.filter(
            record => record.Month === currentMonth && record.Year === year
        );
        const defaultMonth = recordsForCurrentMonth.length > 0 ? currentMonth : previousMonth;
        return defaultMonth;
    };

    React.useEffect(() => {
        if (!!props.componentProps.originalState && props.componentProps.originalState != "") {
            setStateName(props.componentProps.originalState);
        }
        _QuestionData();
        _QuestionDetailsData();
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
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md2">
                        <div className="formGroup pdf-cust-dropdown">
                            <Dropdown
                                placeholder="Select months"
                                label="Month"
                                selectedKeys={selectedKeys}
                                onChange={onChange}
                                multiSelect
                                options={monthOptions}
                                styles={{ dropdown: { width: 300 } }}
                            />

                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md2">
                        <div className="formGroup">
                            <Label className="labelForm">Year</Label>
                            <YearFilter
                                selectedYear={selectedYear}
                                onYearChange={onYearChange}
                                defaultOption={selectedYear}
                                provider={props.provider}
                                isRequired={true}
                                AllOption={true} />
                        </div>
                    </div>
                    {/* <div className="ms-Grid-col ms-sm12 ms-md5">
                    </div> */}
                    <div className="ms-Grid-col ms-sm12 ms-md8 jcc-btn-mt">
                        <div className="formGroup dflex">
                            <div>
                                <PrimaryButton
                                    className="btn btn-danger send-email-btn"
                                    text="Close"
                                    onClick={onClickClose}
                                />
                            </div>
                            <div className="">
                                <CommonPopup
                                    isPopupVisible={isPopupVisible} hidePopup={hidePopup} title={title} sendToEmail={sendToEmail} onChangeTitle={onChangeTitle} onChangeSendToEmail={onChangeSendToEmail} displayerrortitle={displayerrortitle} displayerroremail={displayerroremail} displayerror={displayerror} onClickSendEmail={onClickSendEmail} onClickCancel={onClickCancel} onclickSendEmail={onclickSendEmail}
                                />
                            </div>
                            <div>
                                <PrimaryButton className="btn btn-primary send-email-btn" onClick={onClickDownload}>
                                    <FontAwesomeIcon icon="download" className="clsbtnat" /><div>PDF</div>
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div id="pdfJCC">
                            <div>
                                <div className="asset-card-2-header-jcc">
                                    <div className="card-jcc-header">
                                        <img src={imgLogo} height="90px" width="90px" className="course-img-first" />
                                        <h2 className="card-header-head">Site KPI's</h2>
                                    </div>
                                    <div className="table-row">
                                        <div className="pb-16 pl-16 pr-16 wts text-start mb-3 total-td-jcc">
                                            <span className="mb-0 headerPDF">
                                                {SiteName} &nbsp;({!!StateName ? StateName : props?.loginUserRoleDetails?.siteManagerItem[0]?.QCState?.Title}) &nbsp;
                                            </span>
                                            <span className="Total">Year: &nbsp;<b>{selectedYear}</b></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div >
                                {QuestionData.map((mainItem: any) => {
                                    const matchingDetails = QuestionDetailsData.filter((detail: any) => detail.QuestionId === mainItem.ID);

                                    if (matchingDetails.length > 0) {
                                        const monthOrder = [
                                            "December", "November", "October", "September", "August",
                                            "July", "June", "May", "April", "March", "February", "January"
                                        ];

                                        const sortedMatchingDetails = matchingDetails.sort((a, b) => {
                                            return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
                                        });

                                        return (
                                            <div className="asset-card-2-jcc keep-together" key={mainItem.ID}>
                                                <div className="card-jcc">
                                                    <div style={{ marginBottom: '0px' }}>
                                                        <div className="textfield-container-jcc-pdf dflex justifyContentBetween">
                                                            <div className="jcc-pdf-bold text-ellipsis-jcc">{mainItem.Title}</div>
                                                            <div>{mainItem.Frequency}</div>
                                                        </div>

                                                        {/* Map over sortedMatchingDetails instead of matchingDetails */}
                                                        {sortedMatchingDetails.map((detail) => (
                                                            <div className="item-pdf-jcc" key={detail.ID}>
                                                                <label className="pdf-lbl-font">{detail.Month}</label>
                                                                {detail.Status === "Not Yet Checked" &&
                                                                    <div className='greenGrey badge dInlineBlock jcc-pdf-badge'>{detail.Status}</div>}
                                                                {detail.Status === "Completed" &&
                                                                    <div className='greenBadge badge dInlineBlock jcc-pdf-badge'>{detail.Status}</div>}
                                                                {detail.Status === "Not Required" &&
                                                                    <div className='yellowBadge badge dInlineBlock jcc-pdf-badge'>{detail.Status}</div>}
                                                                {detail.Status === "Overdue" &&
                                                                    <div className='redBadge badge dInlineBlock jcc-pdf-badge'>{detail.Status}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}


                            </div>
                        </div>
                        <div className="asset-card-2-btn">
                            <div className="card-btn-width-pdf">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 justify-lg-right">
                                    <PrimaryButton
                                        style={{ marginBottom: "5px", marginTop: "10px" }}
                                        className="btn btn-danger"
                                        text="Close"
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