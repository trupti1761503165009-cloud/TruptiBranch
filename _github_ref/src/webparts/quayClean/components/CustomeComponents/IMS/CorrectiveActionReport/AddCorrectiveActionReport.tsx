/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChoiceGroup, DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { logGenerator, onFormatDate, removeElementOfBreadCrum, _getIMSTemplateDetail, _siteData, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import moment from "moment";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { attendeeOptions, DateFormat } from "../../../../../../Common/Constants/CommonConstants";
import { AddOtherEmployee } from "../../../../../../Common/AddOtherEmployee";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import { IMSLocationCommonFilter } from "../../../../../../Common/Filter/IMSLocationCommonFilter";
const imgLogo = require('../../../../assets/images/logo.png');

const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];

export const AddCorrectiveActionReport: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isVisibleCrud = React.useRef<boolean>(false);
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
    const [CorrectiveActionReportDetailsData, setCorrectiveActionReportDetailsData] = React.useState<any[]>([]);
    const [ToolboxTalk, setToolboxTalk] = React.useState<any>();
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Subject, setSubject] = React.useState<string>("");
    const [TemplateDetail, setTemplateDetail] = React.useState<any>();
    const [IMSTemplateCorrectiveActionReportMasterData, setIMSTemplateCorrectiveActionReportMasterData] = React.useState<any[]>([]);
    const [IMSTemplateCorrectiveActionReportDetailsData, setIMSTemplateCorrectiveActionReportDetailsData] = React.useState<any[]>([]);
    const [isTemplatePopupVisible, { setTrue: showTemplatePopup, setFalse: hideTemplatePopup }] = useBoolean(false);

    const [CreateData, setCreateData] = React.useState<any[]>([]);
    const [CreateDetailsData, setCreateDetailsData] = React.useState<any[]>([]);
    const [UpdateData, setUpdateData] = React.useState<any[]>([]);
    const [UpdateDetailsData, setUpdateDetailsData] = React.useState<any[]>([]);
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);

    const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
    const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);

    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [IsLimit, setIsLimit] = React.useState<boolean>(false);
    const [ClientLookUp, setClientLookUp] = React.useState<number[]>([]);
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk } = props;

    const [selectedFiles, setselectedFiles] = React.useState<any[]>([]);
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [selectedToolBoxTalkStatus, setSelectedToolBoxTalkStatus] = React.useState<any>({});
    const [comments, setComments] = React.useState<any>({});

    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [selectedEmployee, setSelectedEmployee] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[] | any>();
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>();
    const [ChairPersonName, setChairPersonName] = React.useState<string>("");
    const [templatedropdownOptions, settemplateDropdownOptions] = React.useState([]);
    const [selectedKey, setSelectedKey] = React.useState(null);
    const TemplateData = React.useRef<any>(null);

    // This States are using for the Role Control
    const [roleOptions, setRoleOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultRole, setDefaultRole] = React.useState<string>("");
    const [otherRole, setOtherRole] = React.useState<string>("");
    const [selectedRole, setSelectedRole] = React.useState<any>();
    const [isRoleUpdatedForEditMode, setIsRoleUpdatedForEditMode] = React.useState<boolean>(false);

    const _onManagerChange = (option: any): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };

    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
        setMeetingLocation("");
    };
    const onChangeSubject = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSubject(newValue || "");
    };

    // on Role DropDown value change
    const _onRoleChange = (option: any): void => {
        setSelectedRole(option?.text);
        setDefaultRole(option?.value);
        setOtherRole("");
    };

    const onChangeOtherRole = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setOtherRole(newValue || "");
    };

    const onIMSLocationChange = (loc: any): void => {
        setMeetingLocation(loc);
    };
    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);

    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);

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

    const handleRichTextChange = (itemId: any, newValue: string) => {
        setComments((prev: any) => ({
            ...prev,
            [itemId]: newValue
        }));
        return newValue
    };


    const onEmployeeChange = (selectedOptions: any[]): void => {
        // const options = [...selectedAttendeeOptions,... selectedOptions];
        setSelectedAttendeeOptions(selectedOptions);
        const selectedEmployeeIds = selectedOptions.map(option => option.text).join(', ');
        const valuesArray = selectedOptions.map((item: any) => item.value);
        setClientLookUp(valuesArray);
        setSelectedEmployee(selectedEmployeeIds);
        if (selectedOptions.length > 50) {
            setIsLimit(true);
        } else {
            setIsLimit(false);
        }
    };

    const onClickClose = () => {
        if (isSiteLevelComponent) {
            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            // props.manageComponentView({
            //     currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "CorrectiveActionReport",
            // });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "IMSKey",
                subpivotName: "CorrectiveActionReport",
            });
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "CorrectiveActionReport", selectedZoneDetails: props.componentProps.selectedZoneDetails });
        }
    };

    const initialToggles = ToolboxTalkData.reduce((acc, item) => {
        acc[item.ID] = false;
        return acc;
    }, {});

    const [showToggles, setShowToggles] = React.useState<any>(initialToggles);

    const getDropdownOptions = (data: any) => {
        const options = data
            .map((item: any) => item.TemplateName)
            .filter((name: any, index: any, self: any) => name && self.indexOf(name) === index) // remove duplicates and empty strings
            .map((name: any) => ({ key: name, text: name }));

        return options;
    };

    const handleDropdownChange = (e: any, option: any) => {
        setSelectedKey(option.key);
        // Find the data that matches the selected template name
        const matchedTemplate = TemplateData.current.find((item: any) => item.TemplateName === option.key);

        // Update the selected template detail state with the matched item
        setTemplateDetail(matchedTemplate);
    };


    React.useEffect(() => {
        if (ToolboxTalkData.length > 0) {
            const initialToggles = ToolboxTalkData.reduce((acc, item) => {
                //acc[item.ID] = true;
                acc[item.ID] = (item.Title == "Basic Detail") ? true : (IsUpdate && item.IsShow) ? true : false;
                return acc;
            }, {});
            setShowToggles(initialToggles);
        }
    }, [ToolboxTalkData]);


    const onToolBoxTalkStatusChange = (detailId: any, newStatus: any) => {
        setSelectedToolBoxTalkStatus((prev: any) => ({
            ...prev,
            [detailId]: newStatus
        }));
    };
    const handleToggleChange = (itemId: any, checked: any) => {
        setShowToggles((prev: any) => ({
            ...prev,
            [itemId]: checked
        }));
    };
    const handleCommentChange = (itemId: any, newValue: any) => {
        setComments((prev: any) => ({
            ...prev,
            [itemId]: newValue
        }));
    };




    const _getIMSTemplateCorrectiveActionReportMasterData = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "CorrectiveActionReportId", "CorrectiveActionReportMasterId", "CorrectiveActionReportMaster/Id", "CorrectiveActionReportMaster/Title",
                "Comment", "MasterId", "IsShow"
            ];
            const expand = ["CorrectiveActionReportMaster"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                // filter: `MasterId eq ${masterId} and IsActive eq 1`,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateCorrectiveActionReportMasterData,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                CorrectiveActionReportId: data.CorrectiveActionReportId ?? 0,
                CorrectiveActionReportMasterId: data.CorrectiveActionReportMasterId ?? 0,
                Comment: data.Comment ?? '',
                MasterId: data.MasterId ?? 0,
                IsShow: data.IsShow ?? false,
                //IsActive: data.IsActive ?? false,
            })) || [];
        } catch (error) {
            console.error("Error fetching _getIMSTemplateCorrectiveActionReportMasterData:", error);
            setIsLoading(false);
        }
    };

    const _getIMSTemplateCorrectiveActionReportDetailsData = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "CorrectiveActionReportDetailsId", "CorrectiveActionReportDetails/Id", "CorrectiveActionReportDetails/Title",
                "CorrectiveActionReportMasterId", "CorrectiveActionReportMaster/Id", "CorrectiveActionReportMaster/Title", "Response", "MasterId"
            ];
            const expand = ["CorrectiveActionReportDetails", "CorrectiveActionReportMaster"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                // filter: `MasterId eq ${masterId} and IsActive eq 1`,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateCorrectiveActionReportDetailsData,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                CorrectiveActionReportDetailsId: data.CorrectiveActionReportDetailsId ?? 0,
                CorrectiveActionReportMasterId: data.CorrectiveActionReportMasterId ?? 0,
                Response: data.Response ?? '',
                MasterId: data.MasterId ?? '',
                //IsActive: data.IsActive ?? false,
            })) || [];
        } catch (error) {
            console.error("Error fetching _getIMSTemplateCorrectiveActionReportDetailsData data:", error);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (TemplateDetail?.ID) {
                try {
                    const [IMSTemplateCorrectiveActionReportMasterData, IMSTemplateCorrectiveActionReportDetailsData] = await Promise.all([
                        _getIMSTemplateCorrectiveActionReportMasterData(TemplateDetail.ID),
                        _getIMSTemplateCorrectiveActionReportDetailsData(TemplateDetail.ID)
                    ]);

                    setIMSTemplateCorrectiveActionReportMasterData(IMSTemplateCorrectiveActionReportMasterData ?? []);
                    setIMSTemplateCorrectiveActionReportDetailsData(IMSTemplateCorrectiveActionReportDetailsData ?? []);
                } catch (error) {
                    console.error("Error fetching IMSTemplate data:", error);
                }
            }
        };
        fetchData();
    }, [TemplateDetail]);


    React.useEffect(() => {
        const formattedDate = moment().format('DD-MM-YYYY');
        setToday(formattedDate);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const id = `CAR-${uniquePart}`;
        setGeneratedID(id);
    }, []);


    React.useEffect(() => {
        const loadSiteData = async () => {
            if (selectedSite) {
                const { SiteData, StateId } = await _siteData(props.provider, selectedSite);
                setSiteData(SiteData);
                setStateId(StateId);
            }
        };
        loadSiteData();
    }, [selectedSite]);


    React.useEffect(() => {
        if (!selectedSite && selectedZoneDetails?.defaultSelectedSitesId?.length === 1) {
            setSelectedSite(selectedZoneDetails.defaultSelectedSitesId[0]);
        }
    }, [selectedZoneDetails]);

    React.useEffect(() => {
        if (IsUpdate) {
            const masterObj = Object.keys(showToggles).map(key => ({
                CorrectiveActionReportMasterId: Number(key),
                Comment: comments[key] || "",
                IsShow: showToggles[key],
                SiteNameId: props?.originalSiteMasterId,
                ID: 0,
                UpdateID: 0
            }));

            let DetailsObj: any[] = [];

            const existingIds = new Set(masterObj.map(item => item.CorrectiveActionReportMasterId));
            const existingIds2 = new Set(DetailsObj.map(item => item.CorrectiveActionReportDetailsId));
            ToolboxTalkData.forEach((item: any) => {
                if (!existingIds.has(item.ID)) {
                    masterObj.push({
                        CorrectiveActionReportMasterId: Number(item.ID),
                        Comment: "N/A",
                        IsShow: false,
                        SiteNameId: props?.originalSiteMasterId,
                        ID: item.ID,
                        UpdateID: item.UpdateID
                    });
                }
            });
            CorrectiveActionReportDetailsData.forEach((item: any) => {
                //if (!existingIds2.has(item.ID)) {
                DetailsObj.push({
                    CorrectiveActionReportDetailsId: Number(item.ID),

                    Response: item.ID in selectedToolBoxTalkStatus ? selectedToolBoxTalkStatus[item.ID] : item.Response,
                    SiteNameId: props?.originalSiteMasterId,
                    CorrectiveActionReportMasterId: item.CorrectiveActionReportMasterId,
                    ID: item.ID,
                    UpdateID: item.UpdateID
                });
                //}
            });

            const selectedData = masterObj.map(master => {
                const matchingItem = ToolboxTalkData.find(toolbox => toolbox.ID === master.CorrectiveActionReportMasterId);
                if (matchingItem) {
                    return {
                        IsShow: master.IsShow,
                        Id: matchingItem.UpdateID,
                        Comment: master.Comment || "N/A"// Comment from masterObj
                    };
                } else {
                    return null; // Or handle cases where no match is found
                }
            }).filter(item => item !== null); // Remove null items if any
            const filteredselectedData = selectedData.filter((item: any) => item.Id !== "");
            setUpdateData(filteredselectedData);

            DetailsObj.forEach(detail => {
                if (detail.ID === 0) {
                    const matchingData = CorrectiveActionReportDetailsData.find(data => data.ID === detail.CorrectiveActionReportDetailsId);
                    if (matchingData) {
                        detail.UpdateID = matchingData.UpdateID;
                    }
                }
            });
            const filteredData = DetailsObj;

            const updatedResponseData = filteredData.map((item: any) => ({
                Id: item.UpdateID,
                Response: item.Response
            }));
            setUpdateDetailsData(updatedResponseData);
            setCreateData(masterObj);
            setCreateDetailsData(DetailsObj);

        } else {
            const masterObj = Object.keys(showToggles).map(key => ({
                CorrectiveActionReportMasterId: Number(key),
                Comment: comments[key] || "",
                IsShow: showToggles[key],
                SiteNameId: props?.originalSiteMasterId
            }));

            let DetailsObj = Object.keys(selectedToolBoxTalkStatus).map(key => ({
                CorrectiveActionReportDetailsId: Number(key),
                Response: selectedToolBoxTalkStatus[key],
                SiteNameId: props?.originalSiteMasterId,
                CorrectiveActionReportMasterId: null
            }));

            const existingIds = new Set(masterObj.map(item => item.CorrectiveActionReportMasterId));
            const existingIds2 = new Set(DetailsObj.map(item => item.CorrectiveActionReportDetailsId));
            ToolboxTalkData.forEach((item: any) => {
                if (!existingIds.has(item.ID)) {
                    masterObj.push({
                        CorrectiveActionReportMasterId: Number(item.ID),
                        Comment: "",
                        IsShow: false,
                        SiteNameId: props?.originalSiteMasterId
                    });
                }
            });
            CorrectiveActionReportDetailsData.forEach((item: any) => {
                if (!existingIds2.has(item.ID)) {
                    DetailsObj.push({
                        CorrectiveActionReportDetailsId: Number(item.ID),
                        Response: "N/A",
                        SiteNameId: props?.originalSiteMasterId,
                        CorrectiveActionReportMasterId: item.CorrectiveActionReportMasterId
                    });
                }
            });

            DetailsObj.forEach(detail => {
                if (detail.CorrectiveActionReportMasterId === null) {
                    const matchingData = CorrectiveActionReportDetailsData.find(data => data.ID === detail.CorrectiveActionReportDetailsId);
                    if (matchingData) {
                        detail.CorrectiveActionReportMasterId = matchingData.CorrectiveActionReportMasterId;
                    }
                }
            });

            const filteredMasterObj = masterObj.filter((item: any) => showToggles[item.CorrectiveActionReportMasterId]);
            const filteredDetailsObj = DetailsObj.filter((detail: any) => showToggles[detail.CorrectiveActionReportMasterId]);
            setCreateData(masterObj);
            setCreateDetailsData(DetailsObj);
        }

    }, [showToggles, comments, selectedToolBoxTalkStatus, CorrectiveActionReportDetailsData]);

    React.useEffect(() => {
        if (SiteData && SiteData.length > 0) {
            const optionSiteManager: any[] = [];
            SiteData.forEach((site: any) => {
                site?.SiteManagerId?.forEach((managerId: any, index: number) => {
                    optionSiteManager.push({
                        value: managerId,
                        key: managerId,
                        text: site.SiteManagerName[index],
                        label: site.SiteManagerName[index]
                    });
                });
            });
            optionSiteManager.push({
                value: props.loginUserRoleDetails.Id,
                key: props.loginUserRoleDetails.Id,
                text: props.loginUserRoleDetails.title,
                label: props.loginUserRoleDetails.title
            });
            setManagerOptions(optionSiteManager); // assuming you have a state called setSiteManagerOptions
        }

    }, [SiteData]);

    const _getRoleChoices = async () => {
        setIsLoading(true);
        try {
            // Fetch choices from your existing service function
            const roleChoices = await props.provider.choiceOption(ListNames.CorrectiveActionReport, "Roles");

            if (Array.isArray(roleChoices) && roleChoices.length > 0) {

                // Map each choice into a standardized option format
                const optionRoles = roleChoices.map((choice, index) => ({
                    key: index,            // unique key for UI components
                    value: choice,         // actual value
                    text: choice,          // display text
                    label: choice          // optional label (useful for UI libraries)
                }));

                // Save to state
                setRoleOptions(optionRoles);
            } else {
                setRoleOptions([]);
            }
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMethodName: "_getRoleChoices",
                CustomErrormessage: "Error fetching Role choices",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx",
            };
            void logGenerator(props.provider, errorObj);
        } finally {
            setIsLoading(false);
        }
    };


    const _getCorrectiveActionReport = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ReportDate,Subject,Location,Roles,FormStatus,CreatedDate,IsActive,SiteNameId,SiteName/Title,ChairpersonId,Chairperson/Title,Chairperson/Name,ReportId,Attendees,AttendeesEmailId,AttendeesEmail/Email,Attachments,AttachmentFiles,Created"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName", "Chairperson", "AttachmentFiles", "AttendeesEmail"],
                filter: `Id eq '${props?.siteMasterId}'`,
                listName: ListNames.CorrectiveActionReport,
            };

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                MeetingDate: !!data.Created ? moment(data.Created).format(DateFormat) : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                ReportId: !!data.ReportId ? data.ReportId : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                Chairperson: !!data.ChairpersonId ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
                                AttendeesEmail: !!data.AttendeesEmailId ? data.AttendeesEmail.map((i: { ID: any; }) => i.ID) : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                ReportDate: !!data.ReportDate ? moment(data.ReportDate).format(DateFormat) : '',
                                CreatedDate: !!data.CreatedDate ? data.CreatedDate : new Date(),
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                Roles: !!data.Roles ? data.Roles : "",
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                //Attachment: attachmentFiledata,
                            }
                        );
                    });
                    setToday(UsersListData[0]?.ReportDate || UsersListData[0]?.MeetingDate);
                    setGeneratedID(UsersListData[0]?.ReportId);
                    setMeetingLocation(UsersListData[0]?.Location);
                    setSubject(UsersListData[0]?.Subject);
                    setChairPersonName(UsersListData[0]?.Chairperson);
                    setToolboxTalk(UsersListData[0]);
                    setSelectedRole(UsersListData[0]?.Roles);
                    setSelectedEmployee(UsersListData[0]?.Attendees);
                    setClientLookUp(UsersListData[0]?.AttendeesEmailId);
                    setSelectedSite(UsersListData[0].SiteNameId);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
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

    const _getCorrectiveActionReportData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SubTitle,SectionType,IsShow,IsComment,CommentTitle,IsDisplayBothTitle"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `IsShow eq 1`,
                listName: ListNames.CorrectiveActionReportMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    if (!!results) {
                        const commentArray: any = {};
                        const UsersListData = results.map((data) => {
                            const matchingCommentData = AllMasterData?.filter(
                                (masterData) => masterData.CorrectiveActionReportMasterId === data.ID
                            );
                            const isShow = matchingCommentData.length > 0 && matchingCommentData[0].IsShow === true;
                            const comment = matchingCommentData.length > 0 ? matchingCommentData[0].Comment : '';
                            const UpdateID = matchingCommentData.length > 0 ? matchingCommentData[0].ID : '';
                            // Store comment in `commentArray` with UpdateID as key
                            if (UpdateID) {
                                commentArray[data.ID] = comment;
                            }
                            return {
                                ID: data.ID,
                                Title: data.Title,
                                SubTitle: !!data.SubTitle ? data.SubTitle : '',
                                SectionType: !!data.SectionType ? data.SectionType : '',
                                IsDisplayBothTitle: (data.IsDisplayBothTitle && data.IsDisplayBothTitle != null) ? data.IsDisplayBothTitle : false,
                                IsShow: isShow,
                                IsComment: (data.IsComment && data.IsComment != null) ? data.IsComment : false,
                                CommentTitle: !!data.CommentTitle ? data.CommentTitle : '',
                                UpdateID: UpdateID,
                                Comment: comment
                            };
                        });

                        setComments(commentArray);
                        setToolboxTalkData(UsersListData);
                        setIsLoading(false);
                    }
                } else {
                    if (!!results) {
                        const UsersListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    SubTitle: !!data.SubTitle ? data.SubTitle : '',
                                    SectionType: !!data.SectionType ? data.SectionType : '',
                                    IsDisplayBothTitle: (data.IsDisplayBothTitle && data.IsDisplayBothTitle != null) ? data.IsDisplayBothTitle : false,
                                    IsShow: true,
                                    IsComment: (data.IsComment && data.IsComment != null) ? data.IsComment : false,
                                    CommentTitle: !!data.CommentTitle ? data.CommentTitle : '',
                                    Comment: "",
                                    UpdateID: 0
                                }
                            );
                        });
                        setToolboxTalkData(UsersListData);
                        setIsLoading(false);
                    }
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_getCorrectiveActionReportData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_getCorrectiveActionReportData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };


    const _CorrectiveActionReportDetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,QuestionType,CorrectiveActionReportMasterId,CorrectiveActionReportMaster/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["CorrectiveActionReportMaster"],
                listName: ListNames.CorrectiveActionReportDetails,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    if (!!results) {
                        const UsersListData = results.map((data) => {
                            const matchingDetailsData = AllDetailData?.find(
                                (detailsDataItem) => detailsDataItem.CorrectiveActionReportDetailsId === data.ID
                            );
                            const response = matchingDetailsData ? matchingDetailsData.Response : '';
                            const UpdateID = matchingDetailsData ? matchingDetailsData.ID : '';
                            return {
                                ID: data.ID,
                                Title: data.Title,
                                QuestionType: !!data.QuestionType ? data.QuestionType : '',
                                Response: response, // Updated response from DetailsData
                                CorrectiveActionReportMasterId: !!data.CorrectiveActionReportMasterId ? data.CorrectiveActionReportMasterId : '',
                                CorrectiveActionReportMaster: !!data.CorrectiveActionReportMaster ? data.CorrectiveActionReportMaster.Title : '',
                                UpdateID: UpdateID,
                                outputStatus: response // Add outputStatus field with the matched response
                            };
                        });
                        setCorrectiveActionReportDetailsData(UsersListData);
                        setIsLoading(false);
                    }
                } else {
                    if (!!results) {
                        const UsersListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    QuestionType: !!data.QuestionType ? data.QuestionType : '',
                                    Response: !!data.Response ? data.Response : '',
                                    CorrectiveActionReportMasterId: !!data.CorrectiveActionReportMasterId ? data.CorrectiveActionReportMasterId : '',
                                    CorrectiveActionReportMaster: !!data.CorrectiveActionReportMaster ? data.CorrectiveActionReportMaster.Title : '',
                                    outputStatus: "",
                                    UpdateID: 0,
                                }
                            );
                        });
                        setCorrectiveActionReportDetailsData(UsersListData);
                        setIsLoading(false);
                    }
                }

            }).catch((error: any) => {
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

    //Details Data
    const MasterData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,CorrectiveActionReportMasterId,CorrectiveActionReportMaster/Title,IsShow,Comment,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["CorrectiveActionReportMaster", "SiteName"],
                //filter: `IsShow eq 1 and MasterId eq '${props?.siteMasterId}'`,
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.CorrectiveActionReportMasterData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                IsShow: !!data.IsShow ? data.IsShow : '',
                                Comment: !!data.Comment ? data.Comment : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                CorrectiveActionReportMasterId: !!data.CorrectiveActionReportMasterId ? data.CorrectiveActionReportMasterId : '',
                                CorrectiveActionReportMaster: !!data.CorrectiveActionReportMaster ? data.CorrectiveActionReportMaster.Title : ''
                            }
                        );
                    });
                    setAllMasterData(UsersListData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
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

    const DetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,CorrectiveActionReportDetailsId,CorrectiveActionReportDetails/Title,Response,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["CorrectiveActionReportDetails", "SiteName"],
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.CorrectiveActionReportDetailsData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Response: !!data.Response ? data.Response : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                CorrectiveActionReportDetailsId: !!data.CorrectiveActionReportDetailsId ? data.CorrectiveActionReportDetailsId : '',
                                CorrectiveActionReportDetails: !!data.CorrectiveActionReportDetails ? data.CorrectiveActionReportDetails.Title : ''
                            }
                        );
                    });
                    setAllDetailData(UsersListData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
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

    React.useEffect(() => {
        setSelectedSite(props?.originalSiteMasterId);
        _getRoleChoices();
        let isVisibleCrud1 = (currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            MasterData();
            DetailsData();
        } else {
            _getCorrectiveActionReportData();
            _CorrectiveActionReportDetailsData();
        }
    }, []);

    React.useEffect(() => {
        if (AllMasterData.length > 0)
            _getCorrectiveActionReportData();
    }, [AllMasterData]);

    React.useEffect(() => {
        if (AllDetailData.length > 0)
            _CorrectiveActionReportDetailsData();
    }, [AllDetailData]);

    React.useEffect(() => {
        // Define an asynchronous function for the effect
        const fetchData = async () => {
            // Check if it's in update mode based on siteMasterId
            if (props?.componentProps?.siteMasterId && props.componentProps.siteMasterId > 0) {
                setUpdateItemId(props.componentProps.siteMasterId);
                _getCorrectiveActionReport(); // Assuming this function is already async
                setIsUpdate(true);
            } else {
                // If not in edit mode, check for the template based on QCStateId
                const stateId = props?.breadCrumItems?.[0]?.manageCompomentItem?.dataObj?.QCStateId;

                if (stateId && stateId > 0) {
                    try {
                        const templateDetail = await _getIMSTemplateDetail(props.provider, props.context, stateId, 'Corrective Action Report');
                        if (templateDetail) {
                            TemplateData.current = templateDetail;
                            const options = getDropdownOptions(templateDetail);
                            settemplateDropdownOptions(options);
                            // setTemplateDetail(templateDetail[0]); // Ensure correct data is set
                            showTemplatePopup();
                        }
                    } catch (error) {
                        console.error("Failed to fetch template detail:", error);
                    }
                }
            }
        };

        // Call the async function
        fetchData();

        // Optionally, return a cleanup function if any subscriptions or event listeners were used
        return () => {
            // Cleanup logic if needed (e.g., aborting network requests)
        };
    }, [props?.componentProps?.siteMasterId, props?.breadCrumItems, props?.provider]);

    React.useEffect(() => {
        if (UpdateItemId && Array.isArray(roleOptions) && roleOptions.length > 0 &&
            typeof selectedRole === "string" && !isRoleUpdatedForEditMode) {

            const roleExists = roleOptions.some(
                (opt) => opt.text?.toLowerCase() === selectedRole.toLowerCase()
            );

            if (!roleExists) {
                setOtherRole(selectedRole);
                setSelectedRole("Other");
                setIsRoleUpdatedForEditMode(true);
            } else {
                setIsRoleUpdatedForEditMode(true);
            }
        }
    }, [roleOptions, selectedRole]);

    const onClickSaveOrUpdate = async (type: string) => {
        //setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        let isValidForm = true;
        const IsCreateNewRecord = (type == "create") ? true : false;
        type = (type == "create") ? "submit" : type;

        try {
            const error: any[] = [];
            if (!selectedSite || selectedSite == "") {
                isValidForm = false;
                error.push(<div>Site is required</div>);
            }
            if (!defaultManager || defaultManager == null) {
                isValidForm = false;
                error.push(<div>Meeting Chairperson is required</div>);
            }
            if (!selectedEmployee || selectedEmployee == null) {
                isValidForm = false;
                error.push(<div>Atleast one Attendee is required</div>);
            }
            if (IsLimit) {
                isValidForm = false;
                error.push(<div>You can select a maximum 50 attendees.</div>);
            }
            // if (!IsUpdate && !CreateDetailsData || CreateDetailsData.length <= 0) {
            // if ((!IsUpdate && (!CreateDetailsData || CreateDetailsData.length <= 0)) || (IsUpdate && (!UpdateDetailsData || UpdateDetailsData.length <= 0))) {
            //     isValidForm = false;
            //     error.push(<div>Please fill the form</div>);
            // }

            if (!isValidForm) {
                //error = <ul><li>Please fill the form  </li></ul>;
                let errormessage = <><ul>{error.map((i: any) => {
                    return <li className="errorPoint">{i}</li>;
                })}</ul></>;
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValidForm, validationMessage: errormessage }));
                toastService.dismiss(toastId);
            } else {
                setIsLoading(true);
                const ReportDate = moment(Today, DateFormat).toDate();

                if (IsUpdate && !IsCreateNewRecord) {
                    const toastMessage = 'Corrective Action Report has been updated successfully!';
                    await props.provider.updateListItemsInBatchPnP(ListNames.CorrectiveActionReportDetailsData, UpdateDetailsData);
                    await props.provider.updateListItemsInBatchPnP(ListNames.CorrectiveActionReportMasterData, UpdateData);
                    const currentDateDate = new Date();
                    const objCARData = {
                        //Title: "",                        
                        //ReportId: !!GeneratedID ? GeneratedID : "",
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        Location: !!MeetingLocation ? MeetingLocation : "",
                        Subject: !!Subject ? Subject : "",
                        Attendees: !!selectedEmployee ? selectedEmployee : "",
                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                        ReportDate: ReportDate.toISOString(),
                        Roles: (selectedRole === "Other") ? otherRole : selectedRole,
                        FormStatus: type,
                        IsSendEmail: (type == "submit" && ToolboxTalk?.FormStatus == "draft") ? true : false
                    };
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: "Update",
                        EntityType: UserActionEntityTypeEnum.CorrectiveActionReport,
                        LogFor: UserActionLogFor.Both,
                        EntityId: UpdateItemId,
                        EntityName: GeneratedID,
                        Details: `Update Corrective Action Report`,
                        StateId: props?.componentProps?.qCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    await props.provider.updateItemWithPnP(objCARData, ListNames.CorrectiveActionReport, UpdateItemId);
                    setTimeout(() => {
                        // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                        // props.manageComponentView({
                        //     currentComponentName: ComponentNameEnum.AddNewSite, isReload: true, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "CorrectiveActionReport"
                        // });
                        onClickClose();
                        setIsLoading(false);
                    }, 1000);

                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {
                    setIsLoading(true);
                    let isValid = true;
                    let createdId: number = 0;
                    if (isValid) {
                        const toastMessage = 'Corrective Action Report has been added successfully!';
                        const currentDateDate = new Date();
                        const objCARData = {
                            Title: !!GeneratedID ? GeneratedID : "",
                            //MeetingDate: currentDateDate.toISOString(),
                            Location: !!MeetingLocation ? MeetingLocation : "",
                            Subject: !!Subject ? Subject : "",
                            ReportId: !!GeneratedID ? GeneratedID : "",
                            ChairpersonId: [defaultManager],
                            SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            Attendees: !!selectedEmployee ? selectedEmployee : "",
                            AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                            ReportDate: ReportDate.toISOString(),
                            Roles: (selectedRole === "Other") ? otherRole : selectedRole,
                            FormStatus: type,
                            CreatedDate: (IsUpdate) ? ToolboxTalk?.CreatedDate ?? new Date() : new Date(),
                            HistoryId: (IsUpdate) ? UpdateItemId : null,
                            IsSendEmail: (type == "submit") ? true : false

                        };
                        await props.provider.createItem(objCARData, ListNames.CorrectiveActionReport).then(async (item: any) => {
                            createdId = item.data.Id;
                            const logObj = {
                                UserName: props?.loginUserRoleDetails?.title,
                                SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                                ActionType: UserActivityActionTypeEnum.Create,
                                EntityType: UserActionEntityTypeEnum.CorrectiveActionReport,
                                EntityId: Number(createdId),
                                LogFor: UserActionLogFor.Both,
                                EntityName: GeneratedID,
                                Details: `Add Corrective Action Report`,
                                StateId: props?.componentProps?.qCStateId
                            };
                            void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                            if (createdId > 0) {
                                let updatedCreateData;
                                let updatedCreateDetailsData;
                                if (!IsUpdate) {
                                    updatedCreateData = CreateData.map((item: any) => ({
                                        ...item,
                                        MasterId: createdId,
                                        CorrectiveActionReportId: createdId
                                    }));
                                    updatedCreateDetailsData = CreateDetailsData.map((item: any) => ({
                                        ...item,
                                        MasterId: createdId
                                    }));
                                } else {
                                    updatedCreateData = CreateData.map(({ UpdateID, ID, ...rest }: any) => ({
                                        ...rest,
                                        MasterId: createdId,
                                        CorrectiveActionReportId: createdId
                                    }));

                                    updatedCreateDetailsData = CreateDetailsData.map(({ UpdateID, ID, ...rest }: any) => ({
                                        ...rest,
                                        MasterId: createdId
                                    }));

                                    //Inactive previous record
                                    const toolBoxInactive = {
                                        IsActive: false
                                    };
                                    await props.provider.updateItemWithPnP(toolBoxInactive, ListNames.CorrectiveActionReport, UpdateItemId);
                                }

                                await props.provider.createItemInBatch(updatedCreateData, ListNames.CorrectiveActionReportMasterData);
                                await props.provider.createItemInBatch(updatedCreateDetailsData, ListNames.CorrectiveActionReportDetailsData);

                                if (selectedFiles.length > 0) {

                                } else {

                                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                    setIsLoading(false);
                                    onClickClose();
                                    // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                    // props.manageComponentView({
                                    //     currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "CorrectiveActionReport",
                                    // });
                                }
                            }

                        }).catch(err => console.log(err));
                        setIsLoading(false);
                    } else {
                        toastService.dismiss(toastId);
                        setIsLoading(false);
                    }
                    setIsLoading(false);
                }
            }

        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickSaveOrUpdate Toolbox Talk"
            };
            void logGenerator(props.provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const onClickYes = () => {
        hidePopup();
        onClickSaveOrUpdate('create');
    }

    const onClickNo = () => {
        hidePopup();
        onClickSaveOrUpdate('submit');
    }


    const onClickYesLoadTemplateData = () => {

        if (IMSTemplateCorrectiveActionReportMasterData && IMSTemplateCorrectiveActionReportMasterData.length > 0) {
            const commentArray: any = {};
            const defaultToggles: any = {};
            IMSTemplateCorrectiveActionReportMasterData.forEach((item: any) => {
                commentArray[item.CorrectiveActionReportMasterId] = item.Comment;
                defaultToggles[item.CorrectiveActionReportMasterId] = item.IsShow;
            });
            setComments(commentArray);
            setShowToggles(defaultToggles);
        }
        if (IMSTemplateCorrectiveActionReportDetailsData && IMSTemplateCorrectiveActionReportDetailsData.length > 0) {
            const selectedStatus: any = {};
            IMSTemplateCorrectiveActionReportDetailsData.forEach((item: any) => {
                selectedStatus[item.CorrectiveActionReportDetailsId] = item.Response
            });
            setSelectedToolBoxTalkStatus(selectedStatus);
        }
        hideTemplatePopup();
    }

    const onClickNoLoadTemplateData = () => {
        hideTemplatePopup();
    }

    return <>
        {isLoading && <Loader />}
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        <div className="mt-10">
            <div className="ms-Grid ">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 jcc-btn-mt-20">
                            <div className="formGroup dflex">
                                <div>
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={() => {
                                            onClickClose();
                                            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            // props.manageComponentView({
                                            //     currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "CorrectiveActionReport",
                                            // });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ms-Grid-row">
                        <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
                            <div className="formGroup btnSticky">
                                <div className="va-b inlineBlock">
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={() => {
                                            onClickClose();
                                            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            // props.manageComponentView({
                                            //     currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "CorrectiveActionReport",
                                            // });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="">
                                <div className="boxCard addAddCorrevtiveBox" style={{ marginTop: "0px !important" }}>
                                    <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                        <tr>
                                            <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                            <td className="td-toolbox-talk middle-box"><div>Corrective Action Report</div></td>
                                            <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-CP-11-F1</div></td>
                                        </tr>
                                    </table>
                                    <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">Corrective Action Report ID: {GeneratedID}</div></div></div>
                                    <table className="table-toolbox-talk">
                                        <tr>
                                            <th className="td-toolbox-talk">Date:</th>
                                            <td className="td-toolbox-talk">
                                                {/* {Today} */}
                                                <DatePicker
                                                    showMonthPickerAsOverlay={true}
                                                    strings={defaultDatePickerStrings}
                                                    placeholder="Select a date..."
                                                    ariaLabel="Select a date"
                                                    formatDate={onFormatDate}
                                                    value={IsUpdate
                                                        ? moment(Today, DateFormat).toDate()
                                                        : moment(Today, DateFormat).toDate()}  // Use undefined instead of null
                                                    onSelectDate={(date?: Date) => {
                                                        if (date !== undefined) {
                                                            const strDate = moment(date).format(DateFormat);
                                                            //onToolBoxTalkStatusChange(detailItem.ID, strDate);
                                                            setToday(strDate);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            {IsUpdate ?
                                                <td className="td-toolbox-talk"><b>Subject:</b></td> :
                                                <td className="td-toolbox-talk"><b>Subject: <span className="required"></span></b></td>}
                                            <td className="td-toolbox-talk"><TextField className="formControl" name='Subject' placeholder="Enter Subject" value={Subject} onChange={onChangeSubject} /></td>
                                        </tr>
                                        <tr>
                                            <th className="td-toolbox-talk">Job Site:</th>
                                            {isVisibleCrud.current ?
                                                <td className="td-toolbox-talk">
                                                    <SiteFilter
                                                        isPermissionFiter={true}
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        selectedSite={selectedSite}
                                                        onSiteChange={onSiteChange}
                                                        provider={props.provider}
                                                        isRequired={true}
                                                        AllOption={false}
                                                        selectedSites={selectedZoneDetails} />
                                                </td>
                                                :
                                                <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}</td>
                                            }
                                        </tr>
                                        <tr>
                                            {IsUpdate ?
                                                <td className="td-toolbox-talk"><b>Location:</b></td> :
                                                <td className="td-toolbox-talk"><b>Location:<span className="required"></span></b></td>}

                                            <td className="td-toolbox-talk">
                                                <IMSLocationCommonFilter
                                                    onIMSLocationChange={onIMSLocationChange}
                                                    provider={props.provider}
                                                    selectedIMSLocation={MeetingLocation}
                                                    defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                    siteNameId={selectedSite || props.originalSiteMasterId}
                                                    Title="Corrective Action"
                                                    Label="Location"
                                                    placeHolder="Select Location"
                                                    IsUpdate={IsUpdate}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="td-toolbox-talk">Role:</th>
                                            {roleOptions ?
                                                <td className="td-toolbox-talk">
                                                    <ReactDropdown
                                                        options={roleOptions}
                                                        isMultiSelect={false}
                                                        defaultOption={defaultRole || selectedRole}
                                                        onChange={_onRoleChange}
                                                        isSorted={false}
                                                        isClearable={true}
                                                        placeholder={"Select Role"} />
                                                </td> : <td className="td-toolbox-talk"> {defaultRole}</td>
                                            }
                                        </tr>
                                        {((defaultRole || selectedRole) === "Other") && <tr>
                                            <th className="td-toolbox-talk"></th>
                                            {roleOptions ?
                                                <td className="td-toolbox-talk">
                                                    <TextField
                                                        className="formControl"
                                                        name='Role'
                                                        placeholder="Enter Other Role"
                                                        value={otherRole}
                                                        onChange={onChangeOtherRole} />
                                                </td> : <td className="td-toolbox-talk"> {otherRole}</td>
                                            }
                                        </tr>}
                                        <tr>
                                            <th className="td-toolbox-talk">Meeting Chairperson:</th>
                                            {IsUpdate === false ?
                                                <td className="td-toolbox-talk">
                                                    <ReactDropdown
                                                        options={ManagerOptions} isMultiSelect={false}
                                                        defaultOption={defaultManager || selectedManager}
                                                        onChange={_onManagerChange}
                                                        isClearable={true}
                                                        isDisabled={selectedSite == "" || selectedSite == null}
                                                        placeholder={"Select Chairperson"} />
                                                </td> : <td className="td-toolbox-talk"> {ChairPersonName}</td>
                                            }
                                        </tr>
                                        <tr>
                                            <td className="td-toolbox-talk"><b>Attendee Type: <span className="required"> *</span></b></td>
                                            <td className="td-toolbox-talk">
                                                <div className="divAttendeeType">
                                                    <ChoiceGroup selectedKey={selectedAttendeeType} options={attendeeOptions} onChange={onChange} />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="td-toolbox-talk">Attendees:</th>
                                            <td className="td-toolbox-talk  add-max-width">
                                                <AddOtherEmployee
                                                    onEmployeeChange={onEmployeeChange}
                                                    provider={props.provider}
                                                    // StateId={SiteData[0]?.StateId}
                                                    StateId={StateId}
                                                    isDisabled={selectedSite == "" || selectedSite == null}
                                                    isCloseMenuOnSelect={false}
                                                    defaultOption={ClientLookUp}
                                                    selectedAttendeeType={selectedAttendeeType}
                                                    selectedAttendeeOptions={selectedAttendeeOptions}
                                                />
                                                {IsLimit && <div className="requiredlink">You can select a maximum 50 attendees.</div>}
                                            </td>
                                        </tr>
                                    </table>

                                    <div>
                                        {ToolboxTalkData.length > 0 &&
                                            <div>

                                                {ToolboxTalkData.map((mainItem: any) => {
                                                    const detailItemList = CorrectiveActionReportDetailsData.filter(
                                                        (detail: any) => detail.CorrectiveActionReportMasterId === mainItem.ID
                                                    );

                                                    if (detailItemList.length > 0 || detailItemList.length <= 0) {
                                                        const isMainTitle = !mainItem.SubTitle || mainItem.IsDisplayBothTitle;
                                                        const isSubTitle = (!!mainItem.SubTitle) && !mainItem.IsDisplayBothTitle;
                                                        const titleText = isMainTitle ? mainItem.Title : mainItem.SubTitle;
                                                        const titleClass = isMainTitle ? "main-header-text mt-3 dflex" : "sub-main-header-text mt-2 dflex";
                                                        const isDisplayTitle = (titleText == "Basic Detail") ? false : true;
                                                        // const isDisplayToggle = mainItem.IsDisplayToggle;

                                                        return (
                                                            <div key={mainItem.ID}>

                                                                {isDisplayTitle == true && !isSubTitle && (
                                                                    <div className={titleClass}>
                                                                        {titleText}
                                                                        {isMainTitle && !mainItem.IsDisplayBothTitle && (
                                                                            <div className="toggle-class">
                                                                                {IsUpdate && (ToolboxTalk && ToolboxTalk?.FormStatus !== "draft") ?
                                                                                    <Toggle
                                                                                        checked={showToggles[mainItem.ID] ?? false}
                                                                                        onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                                        onText="Yes"
                                                                                        offText="No"
                                                                                        className="mt-2"
                                                                                        key={mainItem.ID}
                                                                                    /> :
                                                                                    <Toggle
                                                                                        checked={showToggles[mainItem.ID] ?? false} // Ensure a fallback to false if undefined
                                                                                        onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                                        onText="Yes"
                                                                                        offText="No"
                                                                                        className="mt-2"
                                                                                        key={mainItem.ID}
                                                                                    />}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {(mainItem.IsDisplayBothTitle == true || isSubTitle) && (
                                                                    <div className="sub-main-header-text mt-2 dflex">
                                                                        {mainItem.SubTitle}
                                                                        {/* {showToggles[mainItem.ID]} */}

                                                                        <div className="toggle-class">
                                                                            {IsUpdate && (ToolboxTalk && ToolboxTalk?.FormStatus !== "draft") ?
                                                                                <Toggle
                                                                                    checked={showToggles[mainItem.ID] ?? false}
                                                                                    onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                                    onText="Yes"
                                                                                    offText="No"
                                                                                    className="mt-2"
                                                                                    key={mainItem.ID}
                                                                                /> :
                                                                                <Toggle
                                                                                    //checked={!!showToggles && showToggles[mainItem.ID]}
                                                                                    checked={showToggles[mainItem.ID] ?? false} // Ensure a fallback to false if undefined
                                                                                    onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                                    onText="Yes"
                                                                                    offText="No"
                                                                                    className="mt-2"
                                                                                    key={mainItem.ID}
                                                                                />}
                                                                        </div>

                                                                    </div>
                                                                )}

                                                                {/* {(IsUpdate && mainItem.IsShow === false) ? <> */}
                                                                {(IsUpdate && showToggles[mainItem.ID] === false) ? <>
                                                                </>
                                                                    :
                                                                    <>

                                                                        {showToggles[mainItem.ID] && (
                                                                            <div>
                                                                                {mainItem.SectionType === "MultiQuestions" && (
                                                                                    <>
                                                                                        <table className="sub-toolbox-table mt-2">
                                                                                            <thead>
                                                                                                <tr className="sub-toolbox-tr">
                                                                                                    <th className="sub-toolbox-th">Item</th>
                                                                                                    <th className="sub-toolbox-th">Response</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {detailItemList.map((detailItem: any) => (
                                                                                                    <tr className="sub-toolbox-tr" key={detailItem.ID}>
                                                                                                        <td className="sub-toolbox-td-item">{detailItem.Title}</td>
                                                                                                        <td className="sub-toolbox-td-response">
                                                                                                            {detailItem.QuestionType === "Yes|No|NA" && (
                                                                                                                IsUpdate ? (
                                                                                                                    <Dropdown
                                                                                                                        selectedKey={selectedToolBoxTalkStatus[detailItem.ID] || detailItem.outputStatus}
                                                                                                                        options={dropdownOptions}
                                                                                                                        placeholder="Select Status"
                                                                                                                        onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detailItem.ID, option.key)}
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <Dropdown
                                                                                                                        selectedKey={selectedToolBoxTalkStatus[detailItem.ID]}
                                                                                                                        options={dropdownOptions}
                                                                                                                        placeholder="Select Status"
                                                                                                                        onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detailItem.ID, option.key)}
                                                                                                                    />
                                                                                                                )
                                                                                                            )}

                                                                                                            {(detailItem.QuestionType === "FreeTextbox") && (
                                                                                                                IsUpdate ? (
                                                                                                                    <TextField
                                                                                                                        className=""
                                                                                                                        placeholder="Enter New Value"
                                                                                                                        //value={selectedToolBoxTalkStatus[detailItem.ID] || detailItem.outputStatus}
                                                                                                                        value={detailItem.ID in selectedToolBoxTalkStatus ? selectedToolBoxTalkStatus[detailItem.ID] : detailItem.outputStatus}
                                                                                                                        // onChange={(e: any, newValue: any) => handleCommentChange(detailItem.ID, newValue)}
                                                                                                                        onChange={(e: any, newValue: any) => onToolBoxTalkStatusChange(detailItem.ID, newValue)}
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <TextField
                                                                                                                        className=""
                                                                                                                        placeholder="Enter New Value"
                                                                                                                        value={selectedToolBoxTalkStatus[detailItem.ID] || ''}
                                                                                                                        //onChange={(e: any, newValue: any) => handleCommentChange(detailItem.ID, newValue)}
                                                                                                                        onChange={(e: any, newValue: any) => onToolBoxTalkStatusChange(detailItem.ID, newValue)}
                                                                                                                    />
                                                                                                                )
                                                                                                            )}

                                                                                                            {(detailItem.QuestionType === "Date") && (
                                                                                                                IsUpdate ? (
                                                                                                                    <DatePicker
                                                                                                                        showMonthPickerAsOverlay={true}
                                                                                                                        strings={defaultDatePickerStrings}
                                                                                                                        placeholder="Select a date..."
                                                                                                                        ariaLabel="Select a date"
                                                                                                                        formatDate={onFormatDate}
                                                                                                                        value={selectedToolBoxTalkStatus[detailItem.ID] && moment(selectedToolBoxTalkStatus[detailItem.ID], DateFormat).isValid()
                                                                                                                            ? moment(selectedToolBoxTalkStatus[detailItem.ID], DateFormat).toDate()
                                                                                                                            : (detailItem.outputStatus && moment(detailItem.outputStatus, DateFormat).isValid()
                                                                                                                                ? moment(detailItem.outputStatus, DateFormat).toDate()
                                                                                                                                : undefined)}  // Set to undefined if no valid date
                                                                                                                        onSelectDate={(date?: Date) => {
                                                                                                                            if (date !== undefined) {
                                                                                                                                const strDate = moment(date).format(DateFormat);
                                                                                                                                onToolBoxTalkStatusChange(detailItem.ID, strDate);
                                                                                                                            }
                                                                                                                        }}
                                                                                                                    />

                                                                                                                ) : (

                                                                                                                    <DatePicker
                                                                                                                        showMonthPickerAsOverlay={true}
                                                                                                                        strings={defaultDatePickerStrings}
                                                                                                                        placeholder="Select a date..."
                                                                                                                        ariaLabel="Select a date"
                                                                                                                        formatDate={onFormatDate}
                                                                                                                        value={selectedToolBoxTalkStatus[detailItem.ID]
                                                                                                                            ? moment(selectedToolBoxTalkStatus[detailItem.ID], DateFormat).toDate()
                                                                                                                            : undefined}  // Use undefined instead of null
                                                                                                                        onSelectDate={(date?: Date) => {
                                                                                                                            if (date !== undefined) {
                                                                                                                                const strDate = moment(date).format(DateFormat);
                                                                                                                                onToolBoxTalkStatusChange(detailItem.ID, strDate);
                                                                                                                            }
                                                                                                                        }}
                                                                                                                    />


                                                                                                                )
                                                                                                            )}


                                                                                                            {(detailItem.QuestionType === "RichTextBox") && (
                                                                                                                IsUpdate ? (

                                                                                                                    <TextField
                                                                                                                        className=""
                                                                                                                        placeholder="Enter New Value"
                                                                                                                        value={selectedToolBoxTalkStatus[detailItem.ID] || detailItem.outputStatus}
                                                                                                                        // onChange={(e: any, newValue: any) => handleCommentChange(detailItem.ID, newValue)}
                                                                                                                        onChange={(e: any, newValue: any) => onToolBoxTalkStatusChange(detailItem.ID, newValue)}
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <TextField
                                                                                                                        className=""
                                                                                                                        placeholder="Enter New Value"
                                                                                                                        value={selectedToolBoxTalkStatus[detailItem.ID] || ''}
                                                                                                                        //onChange={(e: any, newValue: any) => handleCommentChange(detailItem.ID, newValue)}
                                                                                                                        onChange={(e: any, newValue: any) => onToolBoxTalkStatusChange(detailItem.ID, newValue)}
                                                                                                                    />
                                                                                                                )
                                                                                                            )}


                                                                                                        </td>
                                                                                                    </tr>
                                                                                                ))}
                                                                                            </tbody>
                                                                                        </table>

                                                                                        {mainItem.IsComment && (
                                                                                            <>
                                                                                                <div className="sub-main-header-text mt-2">{mainItem.CommentTitle}</div>
                                                                                                <div className="mt-1">
                                                                                                    <RichText
                                                                                                        value={comments[mainItem.ID] || mainItem.Comment}
                                                                                                        onChange={(text: any) => handleRichTextChange(mainItem.ID, text)}
                                                                                                        isEditMode={true}
                                                                                                    />
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                    </>
                                                                                )}

                                                                                {mainItem.SectionType === "RichTextbox" && (
                                                                                    <div className="mt-1">
                                                                                        <RichText
                                                                                            value={comments[mainItem.ID] || mainItem.Comment}
                                                                                            onChange={(text: any) => handleRichTextChange(mainItem.ID, text)}
                                                                                            isEditMode={true}
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {mainItem.SectionType === "FreeTextbox" && (
                                                                                    <div className="mt-1">
                                                                                        <TextField
                                                                                            className="formControl"
                                                                                            placeholder="Enter New Value"
                                                                                            value={comments[mainItem.ID] || ''}
                                                                                            multiline
                                                                                            rows={3}
                                                                                            onChange={(e: any, newValue: any) => handleCommentChange(mainItem.ID, newValue)}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                    </>
                                                                }


                                                            </div>
                                                        )
                                                    }

                                                    return null;
                                                })}
                                            </div>
                                        }
                                    </div>

                                    <div className="asset-card-2-header-jcc-2 mar-bot-40">
                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">

                                            {(ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") && (
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text="Save as Draft"
                                                    onClick={() => onClickSaveOrUpdate('draft')}
                                                />
                                            )}

                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                className="btn btn-primary"
                                                text={(ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") ? 'Save and Send' : 'Update'}
                                                onClick={() => {
                                                    if (ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") {
                                                        onClickSaveOrUpdate('submit');
                                                    } else {
                                                        //onClickYes();
                                                        showPopup();
                                                    }
                                                }}
                                            />

                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                                className="btn btn-danger"
                                                text="Cancel"
                                                onClick={() => {
                                                    onClickClose();
                                                    // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                                    // props.manageComponentView({
                                                    //     currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "CorrectiveActionReport",
                                                    // });
                                                }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div >

        {isPopupVisible && (
            <Layer>
                <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <Popup role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Confirmation</h2>
                            <div className="mt-3">
                                Do you want to resend the updated form to the attendees?
                            </div>

                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>)
        }


        {isTemplatePopupVisible && (
            <Layer>
                <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hideTemplatePopup}>
                    <Overlay onClick={hideTemplatePopup} />
                    <FocusTrapZone>
                        <Popup role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Confirmation</h2>
                            <div className="mt-3">
                                Template is available for this state. Do you want to load data from template?
                            </div>
                            <div className="mt-2">
                                <Dropdown
                                    selectedKey={selectedKey}
                                    required={true}
                                    label="Template Name"
                                    options={templatedropdownOptions.length > 0 ? templatedropdownOptions : [{ key: '', text: '' }]}
                                    placeholder="Select Template Name"
                                    onChange={handleDropdownChange}
                                />
                            </div>
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickYesLoadTemplateData} disabled={!selectedKey} className={selectedKey ? 'mrt15 css-b62m3t-container btn btn-primary' : 'mrt15 css-b62m3t-container btn btn-sec'} />
                                {/* <PrimaryButton text="Yes" onClick={onClickYesLoadTemplateData} className='mrt15 css-b62m3t-container btn btn-primary' /> */}
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNoLoadTemplateData} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>)
        }
    </>;
};