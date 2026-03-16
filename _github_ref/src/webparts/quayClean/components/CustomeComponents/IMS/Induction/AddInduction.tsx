/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChoiceGroup, DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { CommonConstSiteName, ComponentNameEnum, ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { _getIMSTemplateDetail, getCurrentDateTimeStamp, logGenerator, onFormatDate, removeElementOfBreadCrum } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import SuccessComponent from "../../../CommonComponents/SuccessComponent";
import { AddOtherEmployee } from "../../../../../../Common/AddOtherEmployee";
import { attendeeContractorOptions, attendeeOptions, DateFormat } from "../../../../../../Common/Constants/CommonConstants";
import { AddOtherEmployeeContractor } from "../../../../../../Common/AddOtherEmployeeContractor";
const imgLogo = require('../../../../assets/images/logo.png');
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');

export const AddInduction: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [TemplateDetail, setTemplateDetail] = React.useState<any>();
    const [IMSTemplateToolboxTalkMasterData, setIMSTemplateToolboxTalkMasterData] = React.useState<any[]>([]);
    const [IMSTemplateToolboxTalk, setIMSTemplateToolboxTalk] = React.useState<any[]>([]);
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
    const [ToolboxTalkDetailsData, setToolboxTalkDetailsData] = React.useState<any[]>([]);
    const [CreateData, setCreateData] = React.useState<any[]>([]);
    const [CreateDetailsData, setCreateDetailsData] = React.useState<any[]>([]);
    const [UpdateData, setUpdateData] = React.useState<any[]>([]);
    const [UpdateDetailsData, setUpdateDetailsData] = React.useState<any[]>([]);
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>();
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [title, setTitle] = React.useState<string>("");
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Minutestakenandrecordedby, setMinutestakenandrecordedby] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isTemplatePopupVisible, { setTrue: showTemplatePopup, setFalse: hideTemplatePopup }] = useBoolean(false);
    const [attachmentFiles, setAttachmentFiles] = React.useState<any>(null);
    const [selectedFiles, setselectedFiles] = React.useState<any[]>([]);
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [selectedToolBoxTalkStatus, setSelectedToolBoxTalkStatus] = React.useState<any>({});
    const [comments, setComments] = React.useState<any>({});
    const [MFPM, setMFPM] = React.useState<string>("");
    const [NMFD, setNMFD] = React.useState<string>("");
    const [ClientLookUp, setClientLookUp] = React.useState<number[]>([]);
    const [DiscussionPoints, setDiscussionPoints] = React.useState<string>("");
    const [MainComments, setMainComments] = React.useState<string>("");
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [SiteManager, setSiteManager] = React.useState<any>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM);
    const [selectedEmployee, setSelectedEmployee] = React.useState<any>();
    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
    const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);
    const [ToolboxTalk, setToolboxTalk] = React.useState<any>();
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [attachments, setAttachments] = React.useState<any>();
    const [isComponentClosed, setIsComponentClosed] = React.useState(false);
    const [templateAttachments, setTemplateAttachments] = React.useState<any>();
    const [ListAttachmentsFiles, setListAttachmentsFiles] = React.useState<any>();
    const [templatedropdownOptions, settemplateDropdownOptions] = React.useState([]);
    const [selectedKey, setSelectedKey] = React.useState(null);
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>();
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [ErrorData, setErrorData] = React.useState<any[]>([]);
    const [richTextComments, setRichTextComments] = React.useState<any>({});
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const TemplateData = React.useRef<any>(null);
    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);
    const [IsLimit, setIsLimit] = React.useState<boolean>(false);
    const [AttendeesData, setAttendeesData] = React.useState<any[]>([]);
    const [ValMessage, setValMessage] = React.useState<string>("");
    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);
    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };

    const onClickNo = () => {
        hidePopup2();
    }

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

    const [masterStateId, setMasterStateId] = React.useState(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);

    React.useEffect(() => {
        setMasterStateId(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    }, [SiteData[0]?.StateId, StateId]);


    const [fileattachment, setfileattachment] = React.useState({
        isMultipleFiles: true,
        Files: [],
        isOverwriteFile: true
    });

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
        if (props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground) {
            const message = checkExistingAttendeesContractor(AttendeesData, selectedOptions);
            setValMessage(message);
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
        } else {
            const message = checkExistingAttendees(AttendeesData, selectedOptions);
            setValMessage(message);
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
        }

    };

    const initialToggles = ToolboxTalkData.reduce((acc, item) => {
        acc[item.ID] = false;
        return acc;
    }, {});

    const [showToggles, setShowToggles] = React.useState<any>(initialToggles);

    const checkExistingAttendeesContractor = (AttendeesData: any[], selectedOptions: any[]) => {
        const existingIds = new Set(AttendeesData.map(attendee => attendee.AttendeesEmailId));
        const existingContractorIds = new Set(AttendeesData.map(attendee => attendee.ContractorEmailId));
        const attendeeData = selectedOptions.filter((item: any) => item.type == 'employee');
        const contractorData = selectedOptions.filter((item: any) => item.type == 'contractor');
        const matchedOptions = attendeeData
            .filter(option => existingIds.has(option.uniqueValue))
            .map(option => option.text);
        const matchedCOntractorOptions = contractorData
            .filter(option => existingContractorIds.has(option.uniqueValue))
            .map(option => option.text);
        if (matchedOptions.length > 0 || matchedCOntractorOptions.length > 0) {
            const msg = matchedOptions.length > 0 ? matchedOptions : matchedCOntractorOptions;
            return `Induction Candidate ${msg.join(", ")} already exist.`;
        }
        return "";
    };

    const checkExistingAttendees = (AttendeesData: any[], selectedOptions: any[]) => {
        const existingIds = new Set(AttendeesData.map(attendee => attendee.AttendeesEmailId));
        const matchedOptions = selectedOptions
            .filter(option => existingIds.has(option.value))
            .map(option => option.text);
        if (matchedOptions.length > 0) {
            return `Induction Candidate ${matchedOptions.join(", ")} already exist.`;
        }
        return "";
    };

    React.useEffect(() => {
        if (ToolboxTalkData.length > 0) {
            const initialToggles = ToolboxTalkData.reduce((acc, item) => {
                acc[item.ID] = (IsUpdate && item.IsShow) ? true : false;
                return acc;
            }, {});
            setShowToggles(initialToggles);
        }
    }, [ToolboxTalkData]);

    const onClickCancel = (): void => {
        if (props.isForm) {
            window.open('');
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "Induction",
            });
        }
    };

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

    const onMFPMChange = (newText: string) => {
        newText = newText.replace(" bold ", " <strong>bold</strong> ");
        setMFPM(newText);
        return newText;
    };
    const onNMFDChange = (newText: string) => {
        newText = newText.replace(" bold ", " <strong>bold</strong> ");
        setNMFD(newText);
        return newText;
    };
    const onMainCommentsChange = (newText: string) => {
        newText = newText.replace(" bold ", " <strong>bold</strong> ");
        setMainComments(newText);
        return newText;
    };
    const onDiscussionPointsChange = (newText: string) => {
        newText = newText.replace(" bold ", " <strong>bold</strong> ");
        setDiscussionPoints(newText);
        return newText;
    };

    const _siteData = () => {
        try {
            let filter = "";
            if (props.isForm && (selectedSite !== "" || selectedSite !== undefined)) {
                filter = `ID eq ${selectedSite}`;
            } else {
                filter = `ID eq ${props?.originalSiteMasterId}`;
            }
            const select = ["ID,Title,SiteManagerId,SiteManager/Title,SiteManager/Name,SiteManager/EMail,QCStateId,Category"];
            const expand = ["SiteManager"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: filter,
                listName: ListNames.SitesMaster,
            };

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SiteData: any = results.map((data) => {
                        return (
                            {
                                ID: data?.ID,
                                Title: data?.Title,
                                SiteManagerId: data?.SiteManagerId,
                                SiteManagerName: (!!data.SiteManagerId && data.SiteManagerId.length > 0) ? data.SiteManager.map((i: { Title: any; }) => i.Title) : '',
                                SiteManagerEmail: (!!data.SiteManager && data.SiteManager.length > 0) ? data.SiteManager.map((i: { EMail: any; }) => i.EMail) : '',
                                StateId: !!data.QCStateId ? data.QCStateId : null
                            }
                        );
                    });
                    setSiteData(SiteData);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (TemplateDetail?.ID) {
                try {
                    // const [IMSTemplateToolboxTalkMasterData, IMSTemplateToolboxTalk] = await Promise.all([
                    //     _getIMSTemplateToolboxTalkMasterData(TemplateDetail.ID),
                    //     _getIMSTemplateToolboxTalk(TemplateDetail.ID)
                    // ]);

                    setIMSTemplateToolboxTalkMasterData(IMSTemplateToolboxTalkMasterData ?? []);
                    setIMSTemplateToolboxTalk(IMSTemplateToolboxTalk ?? []);
                } catch (error) {
                    console.error("Error fetching IMSTemplate data:", error);
                }
            }
        };
        fetchData();
    }, [TemplateDetail]);

    React.useEffect(() => {
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
        let SM = props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM;
        const formattedDate = moment().format('DD-MM-YYYY');
        setToday(formattedDate);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const id = `IND-${uniquePart}`;
        setGeneratedID(id);
    }, []);

    React.useEffect(() => {
        _siteData();
    }, [selectedSite]);

    React.useEffect(() => {
        if (IsUpdate) {
            const masterObj = Object.keys(showToggles).map(key => ({
                ToolboxTalkMasterId: Number(key),
                Comment: comments[key] || "",
                IsShow: showToggles[key],
                SiteNameId: props?.originalSiteMasterId,
                ID: 0,
                UpdateID: 0
            }));
            let DetailsObj: any[] = [];
            const existingIds = new Set(masterObj.map(item => item.ToolboxTalkMasterId));
            const existingIds2 = new Set(DetailsObj.map(item => item.ToolboxTalkDetailsId));
            ToolboxTalkData.forEach((item: any) => {
                if (!existingIds.has(item.ID)) {
                    masterObj.push({
                        ToolboxTalkMasterId: Number(item.ID),
                        Comment: "N/A",
                        IsShow: false,
                        SiteNameId: props?.originalSiteMasterId,
                        ID: item.ID,
                        UpdateID: item.UpdateID
                    });
                }
            });
            ToolboxTalkDetailsData.forEach((item: any) => {
                DetailsObj.push({
                    ToolboxTalkDetailsId: Number(item.ID),
                    Response: selectedToolBoxTalkStatus[item.ID] ?? item.Response ?? "N/A",
                    SiteNameId: props?.originalSiteMasterId,
                    ToolboxTalkMasterId: item.ToolboxTalkMasterId,
                    ID: item.ID,
                    UpdateID: item.UpdateID
                });
                //}
            });

            const selectedData = masterObj.map(master => {
                const matchingItem = ToolboxTalkData.find(toolbox => toolbox.ID === master.ToolboxTalkMasterId);
                if (matchingItem) {
                    return {
                        //IsShow: matchingItem.IsShow,
                        IsShow: master.IsShow,
                        Id: matchingItem.UpdateID,
                        Comment: master.Comment || "N/A" // Comment from masterObj
                    };
                } else {
                    return null; // Or handle cases where no match is found
                }
            }).filter(item => item !== null); // Remove null items if any
            const filteredselectedData = selectedData.filter((item: any) => item.Id !== "");
            setUpdateData(filteredselectedData);


            DetailsObj.forEach(detail => {
                if (detail.ID === 0) {
                    const matchingData = ToolboxTalkDetailsData.find(data => data.ID === detail.ToolboxTalkDetailsId);
                    if (matchingData) {
                        detail.UpdateID = matchingData.UpdateID;
                    }
                }
            });
            // const filteredMasterData = masterObj.filter(item => item.ID === 0);
            //const filteredData = DetailsObj.filter(item => item.ID === 0);
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
                ToolboxTalkMasterId: Number(key),
                Comment: comments[key] || "N/A",
                IsShow: showToggles[key],
                SiteNameId: props?.originalSiteMasterId
            }));

            let DetailsObj = Object.keys(selectedToolBoxTalkStatus).map(key => ({
                ToolboxTalkDetailsId: Number(key),
                Response: selectedToolBoxTalkStatus[key],
                SiteNameId: props?.originalSiteMasterId,
                ToolboxTalkMasterId: null
            }));

            const existingIds = new Set(masterObj.map(item => item.ToolboxTalkMasterId));
            const existingIds2 = new Set(DetailsObj.map(item => item.ToolboxTalkDetailsId));
            ToolboxTalkData.forEach((item: any) => {
                if (!existingIds.has(item.ID)) {
                    masterObj.push({
                        ToolboxTalkMasterId: Number(item.ID),
                        Comment: "",
                        IsShow: false,
                        SiteNameId: props?.originalSiteMasterId
                    });
                }
            });
            ToolboxTalkDetailsData.forEach((item: any) => {
                if (!existingIds2.has(item.ID)) {
                    DetailsObj.push({
                        ToolboxTalkDetailsId: Number(item.ID),
                        Response: "N/A",
                        SiteNameId: props?.originalSiteMasterId,
                        ToolboxTalkMasterId: item.ToolboxTalkMasterId
                    });
                }
            });

            DetailsObj.forEach(detail => {
                if (detail.ToolboxTalkMasterId === null) {
                    const matchingData = ToolboxTalkDetailsData.find(data => data.ID === detail.ToolboxTalkDetailsId);
                    if (matchingData) {
                        detail.ToolboxTalkMasterId = matchingData.ToolboxTalkMasterId;
                    }
                }
            });

            const filteredMasterObj = masterObj.filter((item: any) => showToggles[item.ToolboxTalkMasterId]);
            const filteredDetailsObj = DetailsObj.filter((detail: any) => showToggles[detail.ToolboxTalkMasterId]);
            setCreateData(masterObj);
            setCreateDetailsData(DetailsObj);
        }

    }, [showToggles, comments, selectedToolBoxTalkStatus, ToolboxTalkDetailsData]);


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

    const onChangeMeetingLocation = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMeetingLocation(newValue || "");
    };

    const onChangeMinutestakenandrecordedby = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMinutestakenandrecordedby(newValue || "");
    };


    const fileSelectionChange = (e: any) => {
        let files = e.target.files;
        let { Files, isOverwriteFile } = fileattachment;
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
                        name: CreatorName,
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

    const uploadAttachment = async (attachment: any, itemId: any) => {
        try {
            const attachmentUrl = attachment.ServerRelativeUrl;
            const response = await fetch(attachmentUrl);
            const blob = await response.blob();
            const file = new File([blob], attachment.FileName);
            await props.provider.uploadListAttachmentToList(ListNames.ToolboxTalk, file, itemId);

        } catch (error) {
            console.error('Error uploading attachment:', error);
        }
    };

    const onClickSaveOrUpdate = async (type: string) => {
        if (ValMessage == "") {
            setIsLoading(true);
            const toastId = toastService.loading('Loading...');
            let isValidForm = true;
            const IsCreateNewRecord = (type == "create") ? true : false;
            type = (type == "create") ? "submit" : type;
            try {
                const MeetingDate = moment(Today, DateFormat).toDate();
                if (IsUpdate && !IsCreateNewRecord) {
                    // const toastMessage = 'Induction has been updated successfully!';
                    // await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxTalkDetailsData, UpdateDetailsData);
                    // await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxTalkMasterData, UpdateData);
                    // const ToolBoxTalkData = {
                    //     MeetingDate: MeetingDate,
                    //     Location: !!MeetingLocation ? MeetingLocation : "N/A",
                    //     MinutesTakenAndRecordedBy: !!Minutestakenandrecordedby ? Minutestakenandrecordedby : "",
                    //     DiscussionPoints: !!DiscussionPoints ? DiscussionPoints : "",
                    //     Comments: !!MainComments ? MainComments : "N/A",
                    //     MattersfromPreviousMeetings: !!MFPM ? MFPM : "N/A",
                    //     NewMattersforDiscussion: !!NMFD ? NMFD : "",
                    //     SiteNameId: Number(props?.originalSiteMasterId),
                    //     Attendees: !!selectedEmployee ? selectedEmployee : "",
                    //     AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                    //     FormStatus: type,
                    //     IsSendEmail: (type == "submit" && ToolboxTalk?.FormStatus == "draft") ? true : false
                    // };
                    // await props.provider.updateItemWithPnP(ToolBoxTalkData, ListNames.ToolboxTalk, UpdateItemId);

                    // setTimeout(() => {
                    //     if (props.isForm) {
                    //         setIsComponentClosed(true);
                    //     } else {
                    //         const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    //         props.manageComponentView({
                    //             currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, isReload: true, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "Induction",
                    //         });
                    //     }
                    //     //setIsLoading(false);
                    // }, 1000);

                    // toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {
                    setIsLoading(true);
                    let isValid = true;
                    let createdId: number = 0;
                    if (isValid && defaultManager !== null && selectedEmployee !== null) {
                        const toastMessage = 'Induction has been added successfully!';
                        let attendeeEmail: any[] = [];
                        let ContractorEmail: any[] = [];
                        if (props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground) {
                            for (const item of selectedAttendeeOptions) {
                                if (item.type === "employee") {
                                    attendeeEmail.push(item.uniqueValue);
                                } else if (item.type === "contractor") {
                                    ContractorEmail.push(item.uniqueValue);
                                }
                            }
                        } else {
                            attendeeEmail = !!ClientLookUp ? ClientLookUp : []
                        }
                        const InductionData = {
                            Title: !!GeneratedID ? GeneratedID : "",
                            InductionDate: MeetingDate,
                            InductionID: !!GeneratedID ? GeneratedID : "",
                            ChairpersonId: defaultManager,
                            SiteNameId: !!props?.isForm ? Number(selectedSite) : Number(props?.originalSiteMasterId),
                            Attendees: !!selectedEmployee ? selectedEmployee : "",
                            // AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                            AttendeesEmailId: !!attendeeEmail ? attendeeEmail : [],
                            ContractorEmailId: !!ContractorEmail ? ContractorEmail : [],
                            FormStatus: type,
                            IsSendEmail: (type == "submit") ? true : false
                        };
                        await props.provider.createItem(InductionData, ListNames.InductionMaster).then(async (item: any) => {
                            createdId = item.data.Id;

                            let ClientLookUpIds: number[] = ClientLookUp;

                            const generateUniqueKey = (): string => {
                                const timestamp = Date.now().toString(36); // Convert timestamp to base36
                                const randomStr = Math.random().toString(36).substring(2, 8); // Generate random string
                                return (timestamp + randomStr).substring(0, 12).toUpperCase(); // Ensure it's 12 chars
                            };

                            let result: any;
                            if (props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground) {
                                ClientLookUpIds = attendeeEmail;
                                const ContractorIds = ContractorEmail;
                                const generateContracorObjects = (): { InductionMasterId: number; AttendeesEmailId?: number; ContractorEmailId?: number; InductionKey: string }[] => {
                                    return [
                                        ...ClientLookUpIds.map((id) => ({
                                            InductionMasterId: createdId,
                                            AttendeesEmailId: id,
                                            SiteNameId: props?.originalSiteMasterId,
                                            InductionKey: generateUniqueKey(),
                                            ChairpersonId: defaultManager,
                                            ExpiryDate: moment().add(1, "months").toISOString()
                                        })),
                                        ...ContractorIds.map((id) => ({
                                            InductionMasterId: createdId,
                                            ContractorEmailId: id,
                                            SiteNameId: props?.originalSiteMasterId,
                                            InductionKey: generateUniqueKey(),
                                            ChairpersonId: defaultManager,
                                            ExpiryDate: moment().add(1, "months").toISOString()
                                        }))
                                    ];
                                };
                                result = generateContracorObjects();
                            } else {

                                const generateObjects = (): { InductionMasterId: number; AttendeesEmailId: number; InductionKey: string }[] => {
                                    return ClientLookUpIds.map((id) => ({
                                        InductionMasterId: createdId,
                                        AttendeesEmailId: id,
                                        SiteNameId: props?.originalSiteMasterId,
                                        InductionKey: generateUniqueKey(),
                                        ChairpersonId: defaultManager,
                                        ExpiryDate: moment().add(1, "months").toISOString()
                                    }));
                                };
                                result = generateObjects();
                            }

                            await props.provider.createItemInBatch(result, ListNames.InductionDetail);

                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                            props.manageComponentView({
                                currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "Induction",
                            });
                        }).catch(err => console.log(err));
                        setIsLoading(false);
                    } else {
                        const errormsg: any[] = [];

                        if (defaultManager == null) {
                            errormsg.push(<div>Induction by is required</div>);
                        }
                        if (selectedEmployee == null) {
                            errormsg.push(<div>Atlease one Attendees is required</div>);
                        }
                        if (IsLimit) {
                            errormsg.push(<div>You can select a maximum 50 attendees.</div>);
                        }
                        setErrorData(errormsg);
                        showPopup2();
                        toastService.dismiss(toastId);
                        setIsLoading(false);
                    }
                    setIsLoading(false);
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
        } else {
            showPopup2();
        }
    };

    const onDeleteFile = (FileName: any) => {
        props.provider.deleteAttachment(ListNames.ToolboxTalk, ToolboxTalk?.ID, FileName);
        const updatedAttachments = attachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        setAttachments(updatedAttachments);
    }

    const onDeleteTemplateAttachmentFile = (FileName: any) => {
        // provider.deleteAttachment(ListNames.IMSTemplateMaster, ToolboxTalk?.ID, FileName);
        const updatedAttachments = templateAttachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        const updatedAttach = ListAttachmentsFiles.filter((i: any) => { return i.FileName !== FileName });
        setTemplateAttachments(updatedAttachments);
        setListAttachmentsFiles(updatedAttach);
    }

    React.useEffect(() => {
        setIsLoading(true);
        try {
            const select = ["ID,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,ID,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail,ContractorEmail"],
                filter: `SiteNameId eq '${props?.originalSiteMasterId}' and IsDeleted ne 1`,
                listName: ListNames.InductionDetail,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                InductionKey: !!data.InductionKey ? data.InductionKey : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                ContractorEmailId: !!data.ContractorEmailId ? data.ContractorEmailId : [],
                                FullAttendees: !!data.AttendeesEmailId ? data.AttendeesEmail : data.ContractorEmailId ? data.ContractorEmail : [],
                            }
                        );
                    });
                    setAttendeesData(listData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);

        }

    }, []);

    // React.useEffect(() => {
    //     if (AllDetailData.length > 0)
    //         _ToolboxTalkDetailsData();
    // }, [AllDetailData]);



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
        const fetchData = async () => {
            if (props?.componentProps?.siteMasterId && props.componentProps.siteMasterId > 0) {
                setUpdateItemId(props?.componentProps?.siteMasterId);
                setIsUpdate(true);
                // _ToolboxTalk();
            } else {
                const stateId = props?.breadCrumItems?.[0]?.manageCompomentItem?.dataObj?.QCStateId;
                if (stateId && stateId > 0) {
                    try {
                        const templateDetail = await _getIMSTemplateDetail(props.provider, props.context, stateId, 'Toolbox Talk', notFoundImage);
                        if (templateDetail) {
                            TemplateData.current = templateDetail;
                            const options = getDropdownOptions(templateDetail);
                            settemplateDropdownOptions(options);
                            // setTemplateDetail(templateDetail[0]); // Ensure correct data is set
                            // showTemplatePopup();
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

    const onClickYesConfirm = () => {
        hidePopup();
        onClickSaveOrUpdate('create');
    }

    const onClickNoConfirm = () => {
        hidePopup();
        onClickSaveOrUpdate('submit');
    }

    const onClickYesLoadTemplateData = () => {
        setMFPM(TemplateDetail?.MattersfromPreviousMeetings ?? "");
        setNMFD(TemplateDetail?.NewMattersforDiscussion ?? "");
        setDiscussionPoints(TemplateDetail?.DiscussionPoints ?? "");
        setMainComments(TemplateDetail?.Comments ?? "");
        setTemplateAttachments(TemplateDetail.Attachment);
        setListAttachmentsFiles(TemplateDetail.AttachmentFiles);
        if (IMSTemplateToolboxTalkMasterData && IMSTemplateToolboxTalkMasterData.length > 0) {
            const commentArray: any = {};
            const defaultToggles: any = {};
            IMSTemplateToolboxTalkMasterData.forEach((item: any) => {
                commentArray[item.ToolboxTalkMasterId] = item.Comment;
                defaultToggles[item.ToolboxTalkMasterId] = item.IsShow;
            });
            setComments(commentArray);
            setShowToggles(defaultToggles);
        }
        if (IMSTemplateToolboxTalk && IMSTemplateToolboxTalk.length > 0) {
            const selectedStatus: any = {};
            IMSTemplateToolboxTalk.forEach((item: any) => {
                selectedStatus[item.ToolboxTalkDetailsId] = item?.Response
            });
            setSelectedToolBoxTalkStatus(selectedStatus);
        }
        hideTemplatePopup();
    }

    const onClickNoLoadTemplateData = () => {
        hideTemplatePopup();
    }


    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
    };

    if (isComponentClosed) {
        // Render the success component only when the current one is closed
        return <SuccessComponent />;
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
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
                        <div className="formGroup btnSticky">
                            <div className="va-b inlineBlock">
                                <PrimaryButton
                                    className="btn btn-danger"
                                    text="Close"
                                    onClick={() => {
                                        const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "Induction",
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="">
                            <div className="boxCard">
                                <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                    <tr>
                                        <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                        <td className="td-toolbox-talk middle-box">
                                            {props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground ?
                                                <div>Sydney Showground Induction</div> :
                                                <div>University of Queensland Induction</div>}
                                        </td>
                                        <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-IN-13-F1</div></td>
                                    </tr>
                                </table>
                                <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">Induction ID: {GeneratedID}</div></div></div>
                                <table className="table-toolbox-talk">
                                    <tr>
                                        <td className="td-toolbox-talk"><b>Induction Date:</b></td>
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
                                    {/* <tr>
                                        {props.isForm === false ?
                                            <td className="td-toolbox-talk"><b>Job Site:</b></td>
                                            :
                                            <td className="td-toolbox-talk"><b>Job Site: <span className="required">*</span></b></td>
                                        }
                                        {props.isForm === false ?
                                            <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}</td> :
                                            <td className="td-toolbox-talk">
                                                <SiteFilter
                                                    isPermissionFiter={true}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    selectedSite={selectedSite}
                                                    onSiteChange={onSiteChange}
                                                    provider={props.provider}
                                                    isRequired={true}
                                                    AllOption={false} />
                                            </td>
                                        }
                                    </tr> */}
                                    {props.isForm === true && selectedSite === "" ?
                                        <tr></tr> :
                                        <tr>{IsUpdate ?
                                            <td className="td-toolbox-talk"><b>Induction Send By:</b></td> :
                                            <td className="td-toolbox-talk"><b>Induction Send By: <span className="required"> *</span></b> </td>}
                                            {ManagerOptions && IsUpdate === false ?
                                                <td className="td-toolbox-talk">
                                                    <ReactDropdown
                                                        options={ManagerOptions} isMultiSelect={false}
                                                        defaultOption={defaultManager || selectedManager}
                                                        onChange={_onManagerChange}
                                                        placeholder={"Select Induction Send By"} />
                                                </td> : <td className="td-toolbox-talk"> {ToolboxTalk?.Chairperson}</td>
                                                // </td> : <td className="td-toolbox-talk"> {SiteData[0]?.SiteManagerName?.join(', ')}</td>
                                            }
                                        </tr>

                                    }

                                    {/* <tr>
                                        {IsUpdate ?
                                            <td className="td-toolbox-talk"><b>Meeting Location:</b></td> :
                                            <td className="td-toolbox-talk"><b>Meeting Location:<span className="required"> *</span></b></td>}

                                        <td className="td-toolbox-talk">
                                            <TextField className="formControl" name='MeetingLocation' placeholder="Enter Meeting Location" value={MeetingLocation} onChange={onChangeMeetingLocation} /></td>
                                    </tr>
                                    <tr>
                                        {IsUpdate ?
                                            <td className="td-toolbox-talk"><b>Minutes taken and recorded by:</b></td> :
                                            <td className="td-toolbox-talk"><b>Minutes taken and recorded by: <span className="required"> *</span></b></td>}
                                        <td className="td-toolbox-talk"><TextField className="formControl" name='Minutestakenandrecordedby' placeholder="Enter Minutes taken and recorded by" value={Minutestakenandrecordedby} onChange={onChangeMinutestakenandrecordedby} /></td>
                                    </tr> */}
                                    <tr>
                                        <td className="td-toolbox-talk"><b>Induction Candidates Type: <span className="required"> *</span></b></td>
                                        <td className="td-toolbox-talk">
                                            <div className="divAttendeeType">
                                                {props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground ?
                                                    <ChoiceGroup selectedKey={selectedAttendeeType} options={attendeeContractorOptions} onChange={onChange} />
                                                    : <ChoiceGroup selectedKey={selectedAttendeeType} options={attendeeOptions} onChange={onChange} />}

                                            </div>
                                        </td>
                                    </tr>
                                    {(masterStateId !== undefined) && (
                                        <tr>
                                            {IsUpdate ? (
                                                <td className="td-toolbox-talk"><b>Induction Candidates:</b></td>
                                            ) : (
                                                <td className="td-toolbox-talk"><b>Induction Candidates: <span className="required"> *</span></b></td>
                                            )}
                                            <td className="td-toolbox-talk add-max-width">
                                                {props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground ?
                                                    <AddOtherEmployeeContractor
                                                        onEmployeeChange={onEmployeeChange}
                                                        provider={props.provider}
                                                        // StateId={SiteData[0]?.StateId}
                                                        StateId={props.isForm ? masterStateId : StateId || masterStateId}
                                                        isDisabled={masterStateId !== undefined ? false : true}
                                                        isCloseMenuOnSelect={false}
                                                        defaultOption={ClientLookUp}
                                                        selectedAttendeeType={selectedAttendeeType}
                                                        selectedAttendeeOptions={selectedAttendeeOptions}
                                                    />
                                                    : <AddOtherEmployee
                                                        onEmployeeChange={onEmployeeChange}
                                                        provider={props.provider}
                                                        // StateId={SiteData[0]?.StateId}
                                                        StateId={props.isForm ? masterStateId : StateId || masterStateId}
                                                        isDisabled={masterStateId !== undefined ? false : true}
                                                        isCloseMenuOnSelect={false}
                                                        defaultOption={ClientLookUp}
                                                        selectedAttendeeType={selectedAttendeeType}
                                                        selectedAttendeeOptions={selectedAttendeeOptions}
                                                    />}

                                                {IsLimit && <div className="requiredlink">You can select a maximum 50 attendees.</div>}
                                            </td>
                                        </tr>
                                    )}
                                </table>

                                <div className="asset-card-2-header-jcc-2 mar-bot-40">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">

                                        {/* {(ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") && (
                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                className="btn btn-primary"
                                                text="Save as Draft"
                                                onClick={() => onClickSaveOrUpdate('draft')}
                                            />
                                        )} */}

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
                                            onClick={() => onClickCancel()}
                                        />

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
                                <h2 className="mt-10">Warning</h2>
                                <div className="mt-3">
                                    <ul>
                                        <li className="val-m">
                                            <FontAwesomeIcon icon="circle" className="val-icon" /> {ValMessage}
                                        </li>
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