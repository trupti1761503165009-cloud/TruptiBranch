/* eslint-disable no-prototype-builtins */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChoiceGroup, DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Panel, PanelType, Popup, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { ChangeEvent } from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { _getIMSTemplateDetail, getCurrentDateTimeStamp, logGenerator, onFormatDate, removeElementOfBreadCrum, _siteData, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { attendeeOptions, DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { AddOtherEmployee } from "../../../../../../Common/AddOtherEmployee";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { ViewTemplate } from "./ViewDocument";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import { IMSLocationCommonFilter } from "../../../../../../Common/Filter/IMSLocationCommonFilter";
const imgLogo = require('../../../../assets/images/logo.png');
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
const dropdownOptions = [
    { key: 'Action Required', text: 'Action Required' },
    { key: 'Conformance', text: 'Conformance' },
    { key: 'Not Applicable', text: 'Not Applicable' }
];


export const AddWorkplaceInspection: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isVisibleCrud = React.useRef<boolean>(false);
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [TemplateDetail, setTemplateDetail] = React.useState<any>();
    const [IMSTemplateWorkplaceInspectionDetailsData, setIMSTemplateWorkplaceInspectionDetailsData] = React.useState<any[]>([]);
    const [isTemplatePopupVisible, { setTrue: showTemplatePopup, setFalse: hideTemplatePopup }] = useBoolean(false);
    const [ToolboxTalk, setToolboxTalk] = React.useState<any>();
    const [ChairPersonName, setChairPersonName] = React.useState<string>("");
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [WICMData, setWICMData] = React.useState<any[]>([]);
    const [WICMDData, setWICMDData] = React.useState<any[]>([]);
    const [EditData, setEditData] = React.useState<any[]>([]);
    const [ErrorData, setErrorData] = React.useState<any[]>([]);
    const [CreateData, setCreateData] = React.useState<any[]>([]);
    const [CreateMasterData, setCreateMasterData] = React.useState<any[]>([]);
    const [UpdateData, setUpdateData] = React.useState<any[]>([]);
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>();
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Subject, setSubject] = React.useState<string>("");
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [ClientLookUp, setClientLookUp] = React.useState<number[]>([]);
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [SiteManager, setSiteManager] = React.useState<any>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM);
    const [selectedEmployee, setSelectedEmployee] = React.useState<any>("");
    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[] | any>();
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [selectedStatus, setSelectedStatus] = React.useState<{ [key: number]: string }>({});
    const [templatedropdownOptions, settemplateDropdownOptions] = React.useState([]);
    const [selectedKey, setSelectedKey] = React.useState(null);
    const [selectedFiles, setselectedFiles] = React.useState<any[]>([]);
    const [attachmentFiles, setAttachmentFiles] = React.useState<any>(null);
    const [attachments, setAttachments] = React.useState<any>();
    const [comment, setcomment] = React.useState<string>("");
    const [fileURL, setFileURL] = React.useState<string>('');
    const [comments, setComments] = React.useState<any>({});
    const AllMasterData = React.useRef<any[]>([]);
    const [masterFiles, setMasterFiles] = React.useState<any>({});
    const [masterAttachments, setMasterAttachments] = React.useState<any>();
    const [isOpenDoc, { setTrue: showDoc, setFalse: hideDoc }] = useBoolean(false);
    const openModal = () => { showDoc(); };
    const closeModal = () => { hideDoc(); };

    const onStatusChange = (detailId: any, newStatus: any) => {
        setSelectedStatus((prev: any) => ({
            ...prev,
            [detailId]: newStatus
        }));
    };
    const TemplateData = React.useRef<any>(null);
    const [width, setWidth] = React.useState<string>("400px");
    const [IsLimit, setIsLimit] = React.useState<boolean>(false);
    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);

    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("400px");
        }
    }, [window.innerWidth]);

    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
        setMeetingLocation("");
    };

    const onChangeSubject = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSubject(newValue || "");
    };

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

    React.useEffect(() => {
        if (EditData.length > 0) {
            const initialSelectedStatus: { [key: number]: string } = {};
            EditData.forEach((editItem) => {
                initialSelectedStatus[editItem.WICMId] = editItem.Response;
            });
            setSelectedStatus(initialSelectedStatus);
        }
    }, [EditData]);

    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };

    const onClickNo = () => {
        hidePopup2();
    }

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

    const onEmployeeChange = (selectedOptions: any[]): void => {
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

    const initialToggles = WICMData.reduce((acc, item) => {
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

    const WICMasterData = async () => {
        setIsLoading(true);
        try {
            const select = ["ID,WICMId,WICM/Title,Comment,MasterId,Attachments,AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["WICM", "AttachmentFiles"],
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.WorkplaceInspectionChecklistMasterData,
            };
            await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData: any = results.map((data) => {
                        const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxTalk/Attachments/${data.ID}/`;
                        let attachmentFiledata: string[] = []; // Array to hold all attachment URLs

                        if (data.AttachmentFiles.length > 0) {
                            try {
                                data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                        attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                                    } else if (AttachmentData && AttachmentData.FileName) {
                                        attachmentFiledata.push(fixImgURL + AttachmentData.FileName);
                                    } else {
                                        attachmentFiledata.push(notFoundImage);
                                    }
                                });
                            } catch (error) {
                                console.error("Error parsing AttachmentFiles JSON:", error);
                                attachmentFiledata.push(notFoundImage);
                            }
                        } else {
                            attachmentFiledata = [];
                        }
                        return (
                            {
                                ID: data.ID,
                                Comment: !!data.Comment ? data.Comment : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                WICMId: !!data.WICMId ? data.WICMId : '',
                                WICM: !!data.WICM ? data.WICM.Title : '',
                                Attachment: attachmentFiledata,
                                AttachmentFiles: data.AttachmentFiles,
                            }
                        );
                    });
                    AllMasterData.current = UsersListData;
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "MasterData", CustomErrormessage: "error in get master data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "MasterData", CustomErrormessage: "error in get master data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (WICMData.length > 0) {
            const initialToggles = WICMData.reduce((acc, item) => {
                const isShow = ToolboxTalk?.EnabledChecklistId?.includes(item.ID) ?? false;
                acc[item.ID] = IsUpdate && isShow;
                return acc;
            }, {});

            setShowToggles(initialToggles);
        }
    }, [WICMData, ToolboxTalk]);

    React.useEffect(() => {
        if (IsUpdate) {
            const masterObj = Object.entries(showToggles)
                .filter(([key, value]) => value === true)
                .map(([key]) => ({
                    WICMId: Number(key),
                    Comment: comments[key] || "",
                    ID: 0,
                    UpdateID: 0,
                    Files: masterFiles[key] || []
                }));

            const selectedData = masterObj.map(master => {
                const matchingItem = WICMData.find(toolbox => toolbox.ID === master.WICMId);
                if (matchingItem) {
                    return {
                        Id: matchingItem.UpdateID,
                        Comment: master.Comment || "",
                        Files: master.Files || [],
                        WICMId: matchingItem.ID,
                    };
                } else {
                    return null; // Or handle cases where no match is found
                }
            }).filter(item => item !== null); // Remove null items if any
            const filteredselectedData = selectedData.filter((item: any) => item.Id !== "");
            const newData = selectedData.filter((item: any) => item.Id == "");

            setUpdateData(filteredselectedData);
            setCreateMasterData(newData);

        } else {
            const masterObj = Object.entries(showToggles)
                .filter(([key, value]) => value === true)
                .map(([key]) => ({
                    WICMId: Number(key),
                    Comment: comments[key] || "",
                    Files: masterFiles[key] || [],
                }));
            setCreateMasterData(masterObj);
        }

    }, [comments, masterFiles]);

    const handleToggleChange = (itemId: any, checked: any) => {
        setShowToggles((prev: any) => ({
            ...prev,
            [itemId]: checked
        }));
    };

    React.useEffect(() => {
        if (WICMDData.length > 0) {
            const newObjects = WICMDData
                .map(item => ({
                    WICMId: item.ID,
                    Response: selectedStatus[item.ID] ?? "",
                    Title: item.Title,
                    SiteNameId: props?.originalSiteMasterId
                }));
            setCreateData(newObjects);
        }
    }, [selectedStatus, WICMDData]);



    const _getIMSTemplateWorkplaceInspectionDetailsData = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "WICMId", "WICM/Id", "WICM/Title",
                "Response", "MasterId"
            ];
            const expand = ["WICM"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateWorkplaceInspectionDetailsData,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                WICMId: data.WICMId ?? 0,
                Response: data.Response ?? '',
                MasterId: data.MasterId ?? 0,
            })) || [];
        } catch (error) {
            console.error("Error fetching _getIMSTemplateWorkplaceInspectionDetailsData:", error);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (TemplateDetail?.ID) {
                try {
                    const [IMSTemplateWorkplaceInspectionDetailsData] = await Promise.all([
                        _getIMSTemplateWorkplaceInspectionDetailsData(TemplateDetail.ID),
                    ]);

                    setIMSTemplateWorkplaceInspectionDetailsData(IMSTemplateWorkplaceInspectionDetailsData ?? []);
                } catch (error) {
                    console.error("Error fetching IMSTemplate data:", error);
                }
            }
        };
        fetchData();
    }, [TemplateDetail]);


    React.useEffect(() => {
        setSelectedSite(props?.originalSiteMasterId);
        let isVisibleCrud1 = (currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.originalSiteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
        let SM = props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM;
        const formattedDate = moment().format('DD-MM-YYYY');
        setToday(formattedDate);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const id = `WIC-${uniquePart}`;
        if (IsUpdate !== true) {
            setGeneratedID(id);
        }
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

    const _WICMData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,IsComment,AttachFile,IsNote,UserNote"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.WorkplaceInspectionChecklistMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                        const commentArray: any = {};
                        let attachmentArray: any[] = [];
                        const UsersListData = results.map((data) => {
                            const matchingCommentData = AllMasterData.current?.filter(
                                (masterData) => masterData.WICMId === data.ID
                            );
                            const comment = matchingCommentData.length > 0 ? matchingCommentData[0].Comment : '';
                            const attachment = matchingCommentData.length > 0 ? matchingCommentData[0].Attachment : [];
                            const UpdateID = matchingCommentData.length > 0 ? matchingCommentData[0].ID : '';
                            if (UpdateID) {
                                commentArray[data.ID] = comment;
                            }
                            attachmentArray.push({
                                ID: data.ID,
                                Attachment: attachment
                            })
                            return {
                                ID: data.ID,
                                Title: data.Title,
                                AttachFile: data.AttachFile ? data.AttachFile : false,
                                IsComment: data.IsComment ? data.IsComment : false,
                                UpdateID: UpdateID,
                                Comment: comment, // Add Comment if match found,
                                Attachment: attachment,
                                IsNote: !!data.IsNote ? data.IsNote : "",
                                UserNote: !!data.UserNote ? data.UserNote : ""
                            };
                        });
                        setMasterAttachments(attachmentArray);
                        setComments(commentArray);
                        setWICMData(UsersListData);
                        setIsLoading(false);
                    } else {
                        const UsersListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    AttachFile: data.AttachFile ? data.AttachFile : false,
                                    IsComment: data.IsComment ? data.IsComment : false,
                                    Comment: "",
                                    UpdateID: 0,
                                    IsNote: !!data.IsNote ? data.IsNote : "",
                                    UserNote: !!data.UserNote ? data.UserNote : ""
                                }
                            );
                        });
                        setWICMData(UsersListData);
                        setIsLoading(false);
                    }
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_WICMData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_WICMData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const _WICMDData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Response,WorkplaceInspectionMasterId,WorkplaceInspectionMaster/Title,QuestionType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["WorkplaceInspectionMaster"],
                listName: ListNames.WorkplaceInspectionChecklistMasterDetails,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Response: !!data.Response ? data.Response : '',
                                WorkplaceInspectionMasterId: !!data.WorkplaceInspectionMasterId ? data.WorkplaceInspectionMasterId : '',
                                WorkplaceInspectionMaster: !!data.WorkplaceInspectionMaster ? data.WorkplaceInspectionMaster.Title : '',
                                QuestionType: !!data.QuestionType ? data.QuestionType : "",
                            }
                        );
                    });
                    setWICMDData(UsersListData);
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

    const onChangeMeetingLocation = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMeetingLocation(newValue || "");
    };

    const onClickClose = () => {
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "IMSKey",
                subpivotName: "WorkplaceInspection",
            });
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "WorkplaceInspection", selectedZoneDetails: props.componentProps.selectedZoneDetails });
        }
    };

    const onClickSaveOrUpdate = async (type: string) => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        let isValidForm = true;
        const IsCreateNewRecord = (type == "create") ? true : false;
        type = (type == "create") ? "submit" : type;
        try {
            const enabledIds = Object.keys(showToggles)
                .filter(key => showToggles[key])  // Only keep the keys where the value is true
                .map(Number);
            const errormsg: any[] = [];

            if (!selectedSite || selectedSite == "") {
                isValidForm = false;
                errormsg.push(<div>Site is required</div>);
            }
            if (defaultManager == null) {
                isValidForm = false;
                errormsg.push(<div>Checked by is required</div>);
            }
            if (MeetingLocation == "") {
                isValidForm = false;
                errormsg.push(<div>Location is required</div>);
            }
            if (selectedEmployee == "") {
                isValidForm = false;
                errormsg.push(<div>Attendees is required</div>);
            }
            if (IsLimit) {
                isValidForm = false;
                errormsg.push(<div>You can select a maximum 50 attendees.</div>);
            }
            if (type == "submit" && enabledIds.length <= 0) {
                isValidForm = false;
                errormsg.push(<div>Please enable atleast one section</div>);
            }
            if (type !== "draft") {
                let isDataSelected = enabledIds.every(element => {
                    return WICMDData
                        .filter(x => x.WorkplaceInspectionMasterId === element)
                        .every(mItem => CreateData.some(x => x.WICMId === mItem.ID && x.Response != ""));
                });

                if (!isDataSelected) {
                    isValidForm = false;
                    errormsg.push(<div>Please select all the status for enabled sections</div>);
                }
            }

            if (!isValidForm) {
                setErrorData(errormsg);
                setIsLoading(false);
                showPopup2();
                toastService.dismiss(toastId);
            } else {
                const InspectionDate = moment(Today, DateFormat).toDate();
                if (IsUpdate && !IsCreateNewRecord) {

                    const toastMessage = 'Workplace Inspection has been updated successfully!';
                    const createUpdateStatusObjects = async () => {
                        const statusObjects = EditData.map(item => {
                            const response = selectedStatus[item.WICMId];
                            if (response) {
                                return {
                                    Id: item.ID,
                                    Response: response
                                };
                            }
                            return null;
                        }).filter(obj => obj !== null); // Remove null entries
                        await props.provider.updateListItemsInBatchPnP(ListNames.WorkplaceInspectionChecklistMasterDetailsData, statusObjects);
                    };

                    if (EditData.length > 0 && Object.keys(selectedStatus).length > 0) {
                        createUpdateStatusObjects();
                    }
                    const WICUpdateData = {
                        Location: !!MeetingLocation ? MeetingLocation : "N/A",
                        Subject: !!Subject ? Subject : "",
                        Attendees: !!selectedEmployee ? selectedEmployee : "",
                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                        InspectionDate: InspectionDate.toISOString(),
                        FormStatus: type,
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        IsSendEmail: (type == "submit" && ToolboxTalk?.FormStatus == "draft") ? true : false,
                        //EnabledChecklistId: { results: enabledIds }
                        EnabledChecklistId: enabledIds ?? [],
                        Comment: comment ? comment : ""
                    };
                    const updatedCreateMasterData = CreateMasterData.map(({ Id, ...rest }: any) => ({
                        ...rest,
                        MasterId: UpdateItemId,
                    }));

                    await props.provider.createItemInBatchWithAttachment(updatedCreateMasterData, ListNames.WorkplaceInspectionChecklistMasterData);

                    await props.provider.updateListItemsInBatchWithAttachment(ListNames.WorkplaceInspectionChecklistMasterData, UpdateData);

                    const newData = UpdateData.map(({ Id }) => ({
                        Id, // Retain the original Id
                        MasterId: UpdateItemId, // Add MasterId with the value of UpdateId
                    }));
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.WorkplaceInspection,
                        EntityId: Number(UpdateItemId),
                        EntityName: GeneratedID,
                        LogFor: UserActionLogFor.Both,
                        Details: `Update Workplace Inspection`,
                        StateId: props?.componentProps?.qCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    await props.provider.updateItemWithPnP(WICUpdateData, ListNames.WorkplaceInspectionChecklist, UpdateItemId);
                    if (selectedFiles.length > 0) {
                        await props.provider.uploadAttachmentsToListSequential(ListNames.WorkplaceInspectionChecklist, selectedFiles, UpdateItemId).then(() => { console.log("File saved"); }).catch((error) => {
                            console.log("Upload file error" + error);
                        });
                    }

                    setTimeout(() => {
                        onClickClose();
                        setIsLoading(false);
                    }, 1000);
                    //setIsLoading(false);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {
                    setIsLoading(true);
                    let createdId: number = 0;

                    const toastMessage = 'Workplace inspection checklist has been added successfully!';
                    const WICData = {
                        Title: !!GeneratedID ? GeneratedID : "",
                        //MeetingID: !!GeneratedID ? GeneratedID : "",
                        Location: !!MeetingLocation ? MeetingLocation : "N/A",
                        Subject: !!Subject ? Subject : "",
                        ChairpersonId: [defaultManager],
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        Attendees: !!selectedEmployee ? selectedEmployee : "",
                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                        InspectionDate: InspectionDate.toISOString(),
                        FormStatus: type,
                        CreatedDate: (IsUpdate) ? ToolboxTalk?.CreatedDate ?? new Date() : new Date(),
                        HistoryId: (IsUpdate) ? UpdateItemId : null,
                        IsSendEmail: (type == "submit") ? true : false,
                        EnabledChecklistId: enabledIds ?? [],
                        Comment: comment ? comment : ""
                        // EnabledChecklistId: { results: enabledIds }
                    };
                    await props.provider.createItem(WICData, ListNames.WorkplaceInspectionChecklist).then(async (item: any) => {
                        createdId = item.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.WorkplaceInspection,
                            EntityId: Number(createdId),
                            LogFor: UserActionLogFor.Both,
                            EntityName: GeneratedID,
                            Details: `Create Workplace Inspection`,
                            StateId: props?.componentProps?.qCStateId
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                        if (selectedFiles.length > 0) {
                            await props.provider.uploadAttachmentsToListSequential(ListNames.WorkplaceInspectionChecklist, selectedFiles, createdId).then(() => { console.log("File saved"); }).catch((error) => {
                                console.log("Upload file error" + error);
                            });
                        }

                        if (createdId > 0) {
                            let updatedCreateData;
                            let updatedCreateMasterData;
                            if (!IsUpdate) {
                                updatedCreateData = CreateData.map((item: any) => ({
                                    ...item,
                                    MasterId: createdId
                                }));
                            } else {
                                updatedCreateData = CreateData.map(({ UpdateID, ID, ...rest }: any) => ({
                                    ...rest,
                                    MasterId: createdId,
                                    //CorrectiveActionReportId: createdId
                                }));
                                //Inactive previous record
                                const toolBoxInactive = {
                                    IsActive: false
                                };
                                await props.provider.updateItemWithPnP(toolBoxInactive, ListNames.WorkplaceInspectionChecklist, UpdateItemId);
                            }

                            updatedCreateMasterData = CreateMasterData.map(({ UpdateID, Id, ID, ...rest }: any) => ({
                                //const matchingItem = CreateData.find(toolbox => toolbox.ToolboxIncidentMasterId === master.ToolboxIncidentMasterId);
                                ...rest,
                                MasterId: createdId,
                            }));

                            const newData = UpdateData.map(({ Id }) => ({
                                Id, // Retain the original Id
                                MasterId: Number(createdId), // Add MasterId with the value of UpdateId
                            }));
                            if (!!newData && newData.length > 0) {
                                await props.provider.updateListItemsInBatchPnP(ListNames.WorkplaceInspectionChecklistMasterData, newData);
                            }

                            await props.provider.createItemInBatchWithAttachment(updatedCreateMasterData, ListNames.WorkplaceInspectionChecklistMasterData);
                            await props.provider.createItemInBatch(updatedCreateData, ListNames.WorkplaceInspectionChecklistMasterDetailsData);
                            // await props.provider.copyAttachments(ListNames.WorkplaceInspectionChecklistMasterData, UpdateItemId, ListNames.WorkplaceInspectionChecklistMasterData, createdId);
                            toastService.updateLoadingWithSuccess(toastId, toastMessage);
                            setIsLoading(false);
                            onClickClose();
                        }
                    }).catch(err => console.log(err));
                    setIsLoading(false);

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

    const _WorkplaceInspectionData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Subject,ChairpersonId,Chairperson/Title,Chairperson/Name,EnabledChecklistId,EnabledChecklist/Title,InspectionDate,FormStatus,CreatedDate,IsActive,Title,Location,SiteNameId,SiteName/Title,Attendees,Created,Modified,AttendeesEmailId,AttendeesEmail/Email,Comment,Attachments,AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName", "Chairperson", "AttendeesEmail", "EnabledChecklist", "AttachmentFiles"],
                filter: `ID eq '${props?.siteMasterId}'`,
                listName: ListNames.WorkplaceInspectionChecklist,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let UsersListData = results.map((data) => {
                        const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxTalk/Attachments/${data.ID}/`;
                        let attachmentFiledata: string[] = []; // Array to hold all attachment URLs

                        if (data.AttachmentFiles.length > 0) {
                            try {
                                data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                        attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                                    } else if (AttachmentData && AttachmentData.FileName) {
                                        attachmentFiledata.push(fixImgURL + AttachmentData.FileName);
                                    } else {
                                        attachmentFiledata.push(notFoundImage);
                                    }
                                });
                            } catch (error) {
                                console.error("Error parsing AttachmentFiles JSON:", error);
                                attachmentFiledata.push(notFoundImage);
                            }
                        } else {
                            attachmentFiledata = [];
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                MeetingID: !!data.Title ? data.Title : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                                Modified: !!data.Modified ? data.Modified : null,
                                AttendeesEmail: !!data.AttendeesEmailId ? data.AttendeesEmail.map((i: { ID: any; }) => i.ID) : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                MeetingDate: !!data.Created ? moment(data.Created).format(DateFormat) : '',
                                InspectionDate: !!data.InspectionDate ? moment(data.InspectionDate).format(DateFormat) : '',
                                CreatedDate: !!data.CreatedDate ? data.CreatedDate : new Date(),
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                EnabledChecklistId: !!data.EnabledChecklistId ? data.EnabledChecklistId : [],
                                Chairperson: !!data.ChairpersonId ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
                                Attachment: attachmentFiledata,
                                AttachmentFiles: data.AttachmentFiles,
                                Comment: data.Comment ? data.Comment : ""
                            }
                        );
                    });
                    setToday(UsersListData[0]?.InspectionDate || UsersListData[0]?.MeetingDate);
                    setGeneratedID(UsersListData[0]?.Title);
                    setToolboxTalk(UsersListData[0]);
                    setChairPersonName(UsersListData[0]?.Chairperson);
                    setMeetingLocation(UsersListData[0]?.Location);
                    setSubject(UsersListData[0]?.Subject);
                    setSelectedEmployee(UsersListData[0]?.Attendees);
                    setClientLookUp(UsersListData[0]?.AttendeesEmailId);
                    setAttachments(UsersListData[0].Attachment);
                    setcomment(UsersListData[0].Comment);
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

    React.useEffect(() => {
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            console.log();
        } else {
            _WICMData();
            _WICMDData();
        }
    }, []);

    React.useEffect(() => {
        const fetchData = async () => {
            // Check if it's in update mode based on siteMasterId
            if (props?.componentProps?.siteMasterId && props.componentProps.siteMasterId > 0) {
                setUpdateItemId(props?.componentProps?.siteMasterId);
                await WICMasterData();
                _WorkplaceInspectionData();
                setIsUpdate(true);
                _WICMData();
                _WICMDData();
                getUpdateData(); // Assuming this function is already async
            } else {
                // If not in edit mode, check for the template based on QCStateId
                const stateId = props?.breadCrumItems?.[0]?.manageCompomentItem?.dataObj?.QCStateId;

                if (stateId && stateId > 0) {
                    try {
                        const templateDetail = await _getIMSTemplateDetail(props.provider, props.context, stateId, 'Workplace Inspection Checklist');
                        if (templateDetail) {
                            TemplateData.current = templateDetail;
                            const options = getDropdownOptions(templateDetail);
                            settemplateDropdownOptions(options);
                            showTemplatePopup();
                        }
                    } catch (error) {
                        console.error("Failed to fetch template detail:", error);
                    }
                }
            }
        };
        fetchData();
        return () => {
            // Cleanup logic if needed (e.g., aborting network requests)
        };
    }, [props?.componentProps?.siteMasterId, props?.breadCrumItems, props?.provider]);

    React.useEffect(() => {
        if (ErrorData.length > 0) {
            showPopup2()
        }
    }, [ErrorData]);

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
            setManagerOptions(optionSiteManager);
        }
    }, [SiteData]);

    const getUpdateData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Response,SiteNameId,SiteName/Title,WICMId,WICM/Title,MasterId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `MasterId eq '${props.siteMasterId}'`,
                expand: ["WICM", "SiteName"],
                listName: ListNames.WorkplaceInspectionChecklistMasterDetailsData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Response: !!data.Response ? data.Response : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName?.Title : '',
                                WICMId: !!data.WICMId ? data.WICMId : '',
                                WICM: !!data.WICM ? data.WICM?.Title : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                            }
                        );
                    });
                    setEditData(UsersListData);
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

    const onClickYesConfirm = () => {
        hidePopup();
        onClickSaveOrUpdate('create');
    }

    const onClickNoConfirm = () => {
        hidePopup();
        onClickSaveOrUpdate('submit');
    }

    const onClickYesLoadTemplateData = () => {
        if (TemplateDetail && Array.isArray(TemplateDetail.EnabledChecklistId) && TemplateDetail.EnabledChecklistId.length > 0) {
            const updatedToggles: Record<number, boolean> = { ...showToggles };
            Object.keys(updatedToggles).forEach((key: string) => {
                const keyAsNumber = parseInt(key, 10);
                if (TemplateDetail.EnabledChecklistId.includes(keyAsNumber)) {
                    updatedToggles[keyAsNumber] = true;
                } else {
                    updatedToggles[keyAsNumber] = false;
                }
            });
            setShowToggles(updatedToggles);
        } else {
            console.warn('EnabledChecklistId is not an array or is empty.');
        }

        if (IMSTemplateWorkplaceInspectionDetailsData && IMSTemplateWorkplaceInspectionDetailsData.length > 0) {
            const selectedStatus: any = {};
            IMSTemplateWorkplaceInspectionDetailsData.forEach((item: any) => {
                selectedStatus[item.WICMId] = item.Response
            });
            setSelectedStatus(selectedStatus);
        }
        hideTemplatePopup();
    }

    const onClickNoLoadTemplateData = () => {
        hideTemplatePopup();
    }

    const fileSelectionChange = (e: any) => {
        let files = e.target.files;
        if (e.target.name == "Files") {
            let selectedFiles: any[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    let FileName = file.name.split('.').slice(0, -1).join('.');
                    let ExtantionName = file.name.split('.').pop();
                    let CreatorName = "CreatorFile-" + (i + 1) + getCurrentDateTimeStamp() + "_" + FileName + "." + ExtantionName;
                    let selectedFile: any = {
                        file: file,
                        name: file.name,
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/Shared Documents`,
                        overwrite: true
                    };
                    selectedFiles.push(selectedFile);
                }
            }
            setselectedFiles(selectedFiles);
        }
        else if (e.target.name == "Attachment") {
            let file = e.target.files[0];
            let selectedAttachments: any = {
                file: file,
                name: file.name,
            };
            setAttachmentFiles(selectedAttachments);
        }
    };

    const removeAttachment = (ID: any, filename: any) => {
        return masterAttachments.map((item: any) => {
            if (item.ID === ID) {
                item.Attachment = item.Attachment.filter((file: any) => !file.includes(filename));
            }
            return item;
        });
    }

    const onDeleteMasterFile = async (itm: any, fileName: any) => {
        const itemId = AllMasterData.current.filter((item: any) => item.WICMId === itm.ID);
        await props.provider.deleteAttachment(ListNames.WorkplaceInspectionChecklistMasterData, itemId[0]?.ID, fileName);
        const updatedData = removeAttachment(itm.ID, fileName);
        setMasterAttachments(updatedData);
    }

    const handleRichTextChange = (itemId: any, newValue: string) => {
        setComments((prev: any) => ({
            ...prev,
            [itemId]: newValue
        }));
        return newValue
    };

    const handleFileSelectionChange = (itemId: any, event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files; // Correctly typed as FileList
        if (selectedFiles) {
            setMasterFiles((prev: any) => ({
                ...prev,
                [itemId]: Array.from(selectedFiles), // Convert FileList to an Array
            }));
        }
    };

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
                        <div id="WorkplaceInspection" className="asset-card-2-header-jcc-2 margin-bot-80">
                            <div className="formGroup btnSticky">
                                <div className="va-b inlineBlock">
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={onClickClose}
                                    />
                                </div>
                            </div>
                            <div className="">
                                <div className="boxCard">
                                    <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                        <tr>
                                            <th className="th-toolbox-talk-logo-wi pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                            <td className="td-toolbox-talk middle-box"><div>Workplace Inspection Checklist</div></td>
                                            <td className="td-toolbox-talk blue-box pl-10"><div>Workplace Inspection Id</div><div>QC-CP-15-F1</div></td>
                                        </tr>
                                    </table>
                                    <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">Meeting ID: {GeneratedID}</div></div></div>
                                    <table className="table-toolbox-talk">
                                        <tr>
                                            <th className="td-toolbox-talk">Date:</th>
                                            <td className="td-toolbox-talk">
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
                                            <td className="td-toolbox-talk"><b>Job Site:</b></td>
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
                                                : <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}
                                                </td>}
                                        </tr>

                                        <tr>{IsUpdate === false ?
                                            <td className="td-toolbox-talk"><b>Checked By:<span className="required"> *</span></b></td> :
                                            <td className="td-toolbox-talk"><b>Checked By:</b></td>}

                                            {IsUpdate === false ?
                                                <td className="td-toolbox-talk formControl">
                                                    <ReactDropdown
                                                        options={ManagerOptions} isMultiSelect={false}
                                                        defaultOption={defaultManager || selectedManager}
                                                        onChange={_onManagerChange}
                                                        isClearable={false}
                                                        isDisabled={selectedSite == "" || selectedSite == null}
                                                        placeholder={"Select Manager"} />
                                                </td> : <td className="td-toolbox-talk"> {ChairPersonName}</td>
                                            }
                                        </tr>
                                        <tr>
                                            {IsUpdate ?
                                                <td className="td-toolbox-talk"><b>Location:</b></td> :
                                                <td className="td-toolbox-talk"><b>Location:<span className="required"> *</span></b></td>}
                                            <td className="td-toolbox-talk">
                                                {/* <TextField className="formControl"
                                                    name='MeetingLocation'
                                                    placeholder="Enter Location"
                                                    value={MeetingLocation}
                                                    onChange={onChangeMeetingLocation} /> */}
                                                <IMSLocationCommonFilter
                                                    onIMSLocationChange={onIMSLocationChange}
                                                    provider={props.provider}
                                                    selectedIMSLocation={MeetingLocation}
                                                    defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                    siteNameId={selectedSite || props.originalSiteMasterId}
                                                    Title="Workplace Inspection"
                                                    Label="Location"
                                                    placeHolder="Select Location"
                                                    IsUpdate={IsUpdate}
                                                />
                                            </td>
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
                                            {IsUpdate ?
                                                <td className="td-toolbox-talk"><b>Attendees:</b></td> :
                                                <td className="td-toolbox-talk"><b>Attendees: <span className="required"> *</span></b> </td>}
                                            <td className="td-toolbox-talk  add-max-width">
                                                <AddOtherEmployee
                                                    onEmployeeChange={onEmployeeChange}
                                                    provider={props.provider}
                                                    StateId={StateId}
                                                    isDisabled={StateId !== undefined ? false : true}
                                                    isCloseMenuOnSelect={false}
                                                    defaultOption={ClientLookUp}
                                                    selectedAttendeeType={selectedAttendeeType}
                                                    selectedAttendeeOptions={selectedAttendeeOptions}
                                                />
                                                {IsLimit && <div className="requiredlink">You can select a maximum 50 attendees.</div>}
                                            </td>
                                        </tr>
                                    </table>
                                    {IsUpdate ?
                                        <>
                                            <div>
                                                {WICMData.length > 0 && WICMDData.length > 0 && (
                                                    <div>
                                                        {WICMData.map((item) => {
                                                            const details = WICMDData.filter(
                                                                (detail) => detail.WorkplaceInspectionMasterId === item.ID
                                                            );

                                                            const filterMasterAttachment = masterAttachments.filter(
                                                                (file: any) => file.ID === item.ID
                                                            );

                                                            return (
                                                                <div key={item.ID}>
                                                                    <div className="sub-main-header-text mt-3 dflex">
                                                                        {item.Title}
                                                                        <div className="toggle-class">
                                                                            <Toggle
                                                                                checked={showToggles[item.ID] ?? false}
                                                                                onChange={(e, checked) => handleToggleChange(item.ID, checked)}
                                                                                onText="Yes"
                                                                                offText="No"
                                                                                className="mt-2"
                                                                                key={item.ID}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {/* Check if details exist */}
                                                                    {showToggles[item.ID] && (
                                                                        <div>
                                                                            {details.length > 0 ? (
                                                                                <div>
                                                                                    <table className="sub-toolbox-table mt-2">
                                                                                        <thead>
                                                                                            <tr className="sub-toolbox-tr">
                                                                                                <th className="sub-toolbox-th">Check For</th>
                                                                                                <th className="sub-toolbox-th">Response</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {details.map((detail) => {
                                                                                                const currentStatus = selectedStatus[detail.ID] || '';

                                                                                                return (
                                                                                                    <tr className="sub-toolbox-tr" key={detail.ID}>
                                                                                                        <td className="sub-toolbox-td-item">
                                                                                                            {detail.Title}
                                                                                                        </td>

                                                                                                        <td className="sub-toolbox-td-response">
                                                                                                            {detail.QuestionType === "Textbox" ? (
                                                                                                                <TextField
                                                                                                                    className="formControl"
                                                                                                                    value={selectedStatus[detail.ID] || detail.outputStatus}
                                                                                                                    placeholder="Enter Response"
                                                                                                                    onChange={(e, newValue) => onStatusChange(detail.ID, newValue || '')}
                                                                                                                />
                                                                                                            ) : (
                                                                                                                <Dropdown
                                                                                                                    selectedKey={currentStatus}
                                                                                                                    options={dropdownOptions}
                                                                                                                    placeholder="Select Status"
                                                                                                                    onChange={(e: any, option: any) => onStatusChange(detail.ID, option.key)}
                                                                                                                />
                                                                                                            )}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                );
                                                                                            })}
                                                                                        </tbody>
                                                                                    </table>
                                                                                    {item.IsNote === true &&
                                                                                        <div className="mb-3 richTextrenderUlLi">
                                                                                            <td className="td-toolbox-talk"><b>Note:</b></td>
                                                                                            <div dangerouslySetInnerHTML={{ __html: item.UserNote }} />
                                                                                        </div>
                                                                                    }
                                                                                    {item.AttachFile &&
                                                                                        <>
                                                                                            <div className="pdf-lbl-talk mt-1"><b>Upload File</b></div>
                                                                                            <div className="mt-1">
                                                                                                {IsUpdate ?
                                                                                                    <>
                                                                                                        <TextField
                                                                                                            type="file"
                                                                                                            multiple
                                                                                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileSelectionChange(item.ID, e)}
                                                                                                            name="Files"
                                                                                                            className="FileUpload formControl"
                                                                                                        />
                                                                                                        {filterMasterAttachment[0].Attachment.length > 0 && <ul style={{ marginTop: "5px" }}>
                                                                                                            {
                                                                                                                filterMasterAttachment[0]?.Attachment.map((filePath: any, index: any) => {

                                                                                                                    const fileName = filePath.split('/').pop();
                                                                                                                    return (
                                                                                                                        <li
                                                                                                                            key={index}
                                                                                                                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                                                                                            onClick={() => {
                                                                                                                                setFileURL(filePath);
                                                                                                                                openModal();
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            <span>{fileName}</span>
                                                                                                                            <FontAwesomeIcon
                                                                                                                                icon="trash-alt"
                                                                                                                                style={{ marginLeft: '10px' }}
                                                                                                                                className="ml5 dlticonDoc tooltipcls required"
                                                                                                                                onClick={(event) => {
                                                                                                                                    event.stopPropagation()
                                                                                                                                    onDeleteMasterFile(item, fileName);
                                                                                                                                }}
                                                                                                                            />
                                                                                                                        </li>
                                                                                                                    );

                                                                                                                })
                                                                                                            }
                                                                                                        </ul>}
                                                                                                    </>
                                                                                                    :
                                                                                                    <>
                                                                                                        <TextField
                                                                                                            type="file"
                                                                                                            multiple
                                                                                                            onChange={fileSelectionChange}
                                                                                                            name="Files"
                                                                                                            className="FileUpload formControl"
                                                                                                        />
                                                                                                    </>
                                                                                                }
                                                                                            </div>
                                                                                        </>
                                                                                    }
                                                                                    {(item.IsComment) && (
                                                                                        <>
                                                                                            <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
                                                                                            <div className="mt-1">
                                                                                                <RichText
                                                                                                    value={comments[item.ID] || ""}
                                                                                                    onChange={(text: any) => handleRichTextChange(item.ID, text)}
                                                                                                />
                                                                                            </div>
                                                                                        </>
                                                                                    )}

                                                                                </div>
                                                                            ) : (
                                                                                <div>No details available.</div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div>
                                                {WICMData.length > 0 && WICMDData.length > 0 &&
                                                    <div>

                                                        {WICMData.map((item) => {
                                                            const details = WICMDData.filter(
                                                                (detail) => detail.WorkplaceInspectionMasterId === item.ID
                                                            );
                                                            return (
                                                                <div key={item.ID}>
                                                                    <div className="sub-main-header-text mt-3 dflex">
                                                                        {item.Title}
                                                                        <div className="toggle-class">
                                                                            <Toggle
                                                                                checked={showToggles[item.ID] ?? false}
                                                                                onChange={(e, checked) => handleToggleChange(item.ID, checked)}
                                                                                onText="Yes"
                                                                                offText="No"
                                                                                className="mt-2"
                                                                                key={item.ID}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {(showToggles[item.ID] === false) ? <>
                                                                    </>
                                                                        :
                                                                        <>
                                                                            {details.length > 0 ?
                                                                                <div>
                                                                                    <table className="sub-toolbox-table mt-2">
                                                                                        <thead>
                                                                                            <tr className="sub-toolbox-tr">
                                                                                                <th className="sub-toolbox-th">Check For</th>
                                                                                                <th className="sub-toolbox-th">Response</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {details.map((detail) => (
                                                                                                <tr className="sub-toolbox-tr" key={detail.ID}>
                                                                                                    <td className="sub-toolbox-td-item">{detail.Title}</td>
                                                                                                    <td className="sub-toolbox-td-response">
                                                                                                        {IsUpdate ?
                                                                                                            <> {detail.QuestionType === "Textbox" ?
                                                                                                                <TextField
                                                                                                                    className="formControl"
                                                                                                                    value={selectedStatus[detail.ID] || detail.outputStatus}
                                                                                                                    placeholder="Enter Response"
                                                                                                                    onChange={(e, newValue) => onStatusChange(detail.ID, newValue || '')}
                                                                                                                />
                                                                                                                : <Dropdown
                                                                                                                    selectedKey={selectedStatus[detail.ID] || detail.outputStatus}
                                                                                                                    options={dropdownOptions}
                                                                                                                    placeholder="Select Status"
                                                                                                                    onChange={(e: any, option: any) => onStatusChange(detail.ID, option.key)}
                                                                                                                />}
                                                                                                            </>
                                                                                                            :
                                                                                                            <>
                                                                                                                {detail.QuestionType === "Textbox" ?
                                                                                                                    <TextField
                                                                                                                        className="formControl"
                                                                                                                        value={selectedStatus[detail.ID] || ''}
                                                                                                                        placeholder="Enter Response"
                                                                                                                        onChange={(e, newValue) => onStatusChange(detail.ID, newValue || '')}
                                                                                                                    />
                                                                                                                    :
                                                                                                                    <Dropdown
                                                                                                                        selectedKey={selectedStatus[detail.ID]}
                                                                                                                        options={dropdownOptions}
                                                                                                                        placeholder="Select Status"
                                                                                                                        onChange={(e: any, option: any) => onStatusChange(detail.ID, option.key)}
                                                                                                                    />}
                                                                                                            </>
                                                                                                        }
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))}


                                                                                        </tbody>
                                                                                    </table>
                                                                                    {item.IsNote === true &&
                                                                                        <div className="mb-3 richTextrenderUlLi">
                                                                                            <td className="td-toolbox-talk"><b>Note:</b></td>
                                                                                            <div dangerouslySetInnerHTML={{ __html: item.UserNote }} />
                                                                                        </div>
                                                                                    }
                                                                                    {item.AttachFile &&
                                                                                        <>
                                                                                            <div className="pdf-lbl-talk mt-1"><b>Upload File</b></div>
                                                                                            <div className="mt-1">
                                                                                                <TextField
                                                                                                    type="file"
                                                                                                    multiple
                                                                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileSelectionChange(item.ID, e)}
                                                                                                    name="Files"
                                                                                                    className="FileUpload formControl"
                                                                                                />
                                                                                            </div>
                                                                                        </>
                                                                                    }
                                                                                    {(item.IsComment) && (
                                                                                        <>
                                                                                            <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
                                                                                            <div className="mt-1">
                                                                                                <RichText
                                                                                                    value={comments[item.ID] || ""}
                                                                                                    onChange={(text: any) => handleRichTextChange(item.ID, text)}
                                                                                                />
                                                                                            </div>
                                                                                        </>
                                                                                    )}

                                                                                </div> : <div className="">

                                                                                </div>
                                                                            }</>
                                                                    }
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                }
                                            </div>
                                        </>
                                    }

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
                                                        showPopup();
                                                    }
                                                }}
                                            />

                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                                className="btn btn-danger"
                                                text="Cancel"
                                                onClick={onClickClose}
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
        {
            isPopupVisible2 && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup2}>
                        <Overlay onClick={hidePopup2} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Missing Data</h2>
                                <div className="mt-3"> <ul>
                                    {ErrorData.map((error, index) => (
                                        <li key={index} className="val-m">
                                            <FontAwesomeIcon icon="circle" className="val-icon" /> {error.props.children}
                                        </li>
                                    ))}
                                </ul></div>

                                <DialogFooter>
                                    <DefaultButton text="Close" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )
        }
        {isOpenDoc === true &&
            <ViewTemplate
                isViewDocument={undefined}
                isOpen={isOpenDoc}
                hideDoc={hideDoc}
                fileURL={fileURL}
                mProps={props}
            />
        }

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
                                <PrimaryButton text="Yes" onClick={onClickYesConfirm} className='mrt15 css-b62m3t-container btn btn-primary' />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNoConfirm} />
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
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNoLoadTemplateData} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>)
        }
    </>;
};