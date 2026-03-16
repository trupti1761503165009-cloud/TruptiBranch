/* eslint-disable */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChoiceGroup, DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, ProgressIndicator, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { _getIMSTemplateDetail, generateAndSaveKendoPDF, getCorrectiveId, getCurrentDateTimeStamp, logGenerator, onFormatDate, removeElementOfBreadCrum, _siteData, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import moment from "moment";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AddOtherEmployee } from "../../../../../../Common/AddOtherEmployee";
import { attendeeOptions, DateFormat } from "../../../../../../Common/Constants/CommonConstants";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import { IMSLocationCommonFilter } from "../../../../../../Common/Filter/IMSLocationCommonFilter";
import { DetailToolboxIncident } from "./DetailToolboxIncident";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { faSquareCheck } from "@fortawesome/free-regular-svg-icons";

const imgLogo = require('../../../../assets/images/logo.png');
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');

const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];

export const AddToolboxIncident: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isVisibleCrud = React.useRef<boolean>(false);
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
    const [ToolboxIncidentDetailsData, setToolboxIncidentDetailsData] = React.useState<any[]>([]);
    const [ToolboxTalk, setToolboxTalk] = React.useState<any>();
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Subject, setSubject] = React.useState<string>("");
    const [TemplateDetail, setTemplateDetail] = React.useState<any>();
    const [IMSTemplateToolboxIncidentDetailsData, setIMSTemplateToolboxIncidentDetailsData] = React.useState<any[]>([]);
    const [IMSTemplateToolboxIncidentMasterData, setIMSTemplateToolboxIncidentMasterData] = React.useState<any[]>([]);
    const [isTemplatePopupVisible, { setTrue: showTemplatePopup, setFalse: hideTemplatePopup }] = useBoolean(false);
    const [toolboxIncidentId, setToolboxIncidentId] = React.useState<number>(0)
    const [isToolboxPDFGenerating, setIsToolboxPDFGenerating] = React.useState<boolean>(false);
    const [CreateData, setCreateData] = React.useState<any[]>([]);
    const [CreateDetailsData, setCreateDetailsData] = React.useState<any[]>([]);
    const [CreateDataCAR, setCreateDataCAR] = React.useState<any[]>([]);
    const [CreateDetailsDataCAR, setCreateDetailsDataCAR] = React.useState<any[]>([]);
    const [UpdateData, setUpdateData] = React.useState<any[]>([]);
    const [UpdateDetailsData, setUpdateDetailsData] = React.useState<any[]>([]);
    const [isShowProgressBar, setIsShowProgressBar] = React.useState<boolean>(false);
    const [percentComplete, setPercentComplete] = React.useState<number>(0);

    const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
    const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);

    const [uploadProgress, setUploadProgress] = React.useState<{ label: string, isLoading: boolean, key: string }[]>([])

    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [IsLimit, setIsLimit] = React.useState<boolean>(false);
    const [ClientLookUp, setClientLookUp] = React.useState<number[]>([]);
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);

    // const [StateId, setStateId] = React.useState<string>(props?.loginUserRoleDetails?.siteManagerItem[0]?.QCStateId);
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;

    const [attachments, setAttachments] = React.useState<any>();
    const [masterattachments, setmasterAttachments] = React.useState<any>();
    const [attachmentFiles, setAttachmentFiles] = React.useState<any>(null);
    const [selectedFiles, setselectedFiles] = React.useState<any[]>([]);

    const [templateAttachments, setTemplateAttachments] = React.useState<any>();
    const [ListAttachmentsFiles, setListAttachmentsFiles] = React.useState<any>();

    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [GeneratedCID, setGeneratedCID] = React.useState<string>("");
    const [selectedToolBoxTalkStatus, setSelectedToolBoxTalkStatus] = React.useState<any>({});
    const [comments, setComments] = React.useState<any>({});
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [selectedEmployee, setSelectedEmployee] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>();
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>(props?.loginUserRoleDetails?.title);
    const [ChairPersonName, setChairPersonName] = React.useState<string>("");
    const [templatedropdownOptions, settemplateDropdownOptions] = React.useState([]);
    const [selectedKey, setSelectedKey] = React.useState(null);
    const TemplateData = React.useRef<any>(null);
    const [MasterComment, setMasterComment] = React.useState<any>("");

    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);

    const [masterFiles, setMasterFiles] = React.useState<any>({});

    const [CorrectiveActionReportDetailsData, setCorrectiveActionReportDetailsData] = React.useState<any[]>([]);
    const [CorrectiveActionReportData, setCorrectiveActionReportData] = React.useState<any[]>([]);

    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
        setMeetingLocation("");
    };
    const onChangeSubject = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSubject(newValue || "");
    };
    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);

    const onIMSLocationChange = (loc: any): void => {
        setMeetingLocation(loc);
    };

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
    const popupStylesProgBar = mergeStyleSets({
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
            maxWidth: '1200px',
            width: '90%',
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        }
    });


    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };

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

    const handleRichTextChange = (itemId: any, newValue: string) => {
        setComments((prev: any) => ({
            ...prev,
            [itemId]: newValue
        }));
        return newValue
    };

    const handleRichTextChangeMaster = (newValue: string): string => {
        setMasterComment(newValue);
        return newValue; // Return the updated value as required by the RichText onChange
    };

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

    const MasterFileSelectionChange = (e: any) => {
        let files = e.target.files;
        let { Files, isOverwriteFile } = fileattachment;
        if (e.target.name == "Files") {
            let selectedFiles: any[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    let FileName = file.name.split('.').slice(0, -1).join('.');
                    let ExtantionName = file.name.split('.').pop();
                    let CreatorName = "MasterFile-" + (i + 1) + getCurrentDateTimeStamp() + "_" + FileName + "." + ExtantionName;
                    let selectedFile: any = {
                        file: file,
                        name: CreatorName,
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/Shared Documents`,
                        overwrite: true
                    };
                    selectedFiles.push(selectedFile);
                }
            }
            setMasterFiles(selectedFiles);
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
        setmasterAttachments(matchedTemplate.MasterAttachment);
        // setAttachments(matchedTemplate.CreatorAttachment);
    };

    const uploadAttachment = async (attachment: any, itemId: any) => {
        try {
            const attachmentUrl = attachment.ServerRelativeUrl;
            const response = await fetch(attachmentUrl);
            const blob = await response.blob();
            const file = new File([blob], attachment.FileName);

            await props.provider.uploadListAttachmentToList(ListNames.ToolboxIncident, file, itemId);
            // const oldItemId = props?.siteMasterId ? props?.siteMasterId : 0
            //props.provider.copyAttachments(ListNames.IMSTemplateMaster, oldItemId, ListNames.IMSTemplateMaster, itemId);

        } catch (error) {
            console.error('Error uploading attachment:', error);
        }
    };

    const initialToggles = ToolboxTalkData.reduce((acc, item) => {
        acc[item.ID] = false;
        return acc;
    }, {});

    const [showToggles, setShowToggles] = React.useState<any>(initialToggles);

    React.useEffect(() => {
        if (ToolboxTalkData.length > 0) {
            const initialToggles = ToolboxTalkData.reduce((acc, item) => {
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




    const _getIMSTemplateToolboxIncidentMasterData = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "ToolboxIncidentId", "ToolboxIncidentMasterId", "ToolboxIncidentMaster/Id", "ToolboxIncidentMaster/Title",
                "Comment", "MasterId", "IsShow"
            ];
            const expand = ["ToolboxIncidentMaster"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                // filter: `MasterId eq ${masterId} and IsActive eq 1`,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateToolboxIncidentMasterData,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                ToolboxIncidentId: data.ToolboxIncidentId ?? 0,
                ToolboxIncidentMasterId: data.ToolboxIncidentMasterId ?? 0,
                Comment: data.Comment ?? '',
                MasterId: data.MasterId ?? 0,
                IsShow: data.IsShow ?? false,
                //IsActive: data.IsActive ?? false,
            })) || [];
        } catch (error) {
            console.error("Error fetching _getIMSTemplateToolboxIncidentMasterData:", error);
            setIsLoading(false);
        }
    };
    const _getIMSTemplateToolboxIncidentDetailsData = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "ToolboxIncidentDetailsId", "ToolboxIncidentDetails/Id", "ToolboxIncidentDetails/Title",
                "ToolboxIncidentMasterId", "ToolboxIncidentMaster/Id", "ToolboxIncidentMaster/Title", "Response", "MasterId"
            ];
            const expand = ["ToolboxIncidentDetails", "ToolboxIncidentMaster"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                // filter: `MasterId eq ${masterId} and IsActive eq 1`,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateToolboxIncidentDetailsData,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                ToolboxIncidentDetailsId: data.ToolboxIncidentDetailsId ?? 0,
                ToolboxIncidentMasterId: data.ToolboxIncidentMasterId ?? 0,
                Response: data.Response ?? '',
                MasterId: data.MasterId ?? '',
                //IsActive: data.IsActive ?? false,
            })) || [];
        } catch (error) {
            console.error("Error fetching _getIMSTemplateToolboxIncidentDetailsData data:", error);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (TemplateDetail?.ID) {
                try {
                    const [IMSTemplateToolboxIncidentMasterData, IMSTemplateToolboxIncidentDetailsData] = await Promise.all([
                        _getIMSTemplateToolboxIncidentMasterData(TemplateDetail.ID),
                        _getIMSTemplateToolboxIncidentDetailsData(TemplateDetail.ID)
                    ]);

                    setIMSTemplateToolboxIncidentMasterData(IMSTemplateToolboxIncidentMasterData ?? []);
                    setIMSTemplateToolboxIncidentDetailsData(IMSTemplateToolboxIncidentDetailsData ?? []);
                } catch (error) {
                    console.error("Error fetching IMSTemplate data:", error);
                }
            }
        };
        fetchData();
    }, [TemplateDetail]);


    React.useEffect(() => {
        _CorrectiveActionReportDetailsData();
        _getCorrectiveActionReportData();
        setSelectedSite(props?.originalSiteMasterId);
        let isVisibleCrud1 = (currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        let SM = props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM;
        const formattedDate = moment().format('DD-MM-YYYY');
        setToday(formattedDate);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const id = `IRF-${uniquePart}`;
        setGeneratedID(id);

        const cid = `CAR-${uniquePart}`;
        setGeneratedCID(cid);
    }, []);

    const loadSiteData = async () => {
        if (selectedSite) {
            const { SiteData, StateId } = await _siteData(props.provider, selectedSite);
            setSiteData(SiteData);
            setStateId(StateId);
        }
    };

    React.useEffect(() => {
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
                ToolboxIncidentMasterId: Number(key),
                Comment: comments[key] || "",
                IsShow: showToggles[key],
                SiteNameId: props?.originalSiteMasterId,
                ID: 0,
                UpdateID: 0
            }));
            let DetailsObj: any[] = [];

            const existingIds = new Set(masterObj.map(item => item.ToolboxIncidentMasterId));
            const existingIds2 = new Set(DetailsObj.map(item => item.ToolboxIncidentDetailsId));
            ToolboxTalkData.forEach((item: any) => {
                if (!existingIds.has(item.ID)) {
                    masterObj.push({
                        ToolboxIncidentMasterId: Number(item.ID),
                        Comment: "N/A",
                        IsShow: false,
                        SiteNameId: props?.originalSiteMasterId,
                        ID: item.ID,
                        UpdateID: item.UpdateID
                    });
                }
            });
            ToolboxIncidentDetailsData.forEach((item: any) => {
                DetailsObj.push({
                    ToolboxIncidentDetailsId: Number(item.ID),
                    Response: item.ID in selectedToolBoxTalkStatus ? selectedToolBoxTalkStatus[item.ID] : item.Response,
                    SiteNameId: props?.originalSiteMasterId,
                    ToolboxIncidentMasterId: item.ToolboxIncidentMasterId,
                    ID: item.ID,
                    UpdateID: item.UpdateID
                });
                //}
            });

            const selectedData = masterObj.map(master => {
                const matchingItem = ToolboxTalkData.find(toolbox => toolbox.ID === master.ToolboxIncidentMasterId);
                if (matchingItem) {
                    return {
                        // IsShow: (ToolboxTalk && ToolboxTalk?.FormStatus !== "submit") ? master.IsShow : matchingItem.IsShow,
                        IsShow: master.IsShow,
                        Id: matchingItem.UpdateID,
                        Comment: master.Comment// Comment from masterObj
                    };
                } else {
                    return null; // Or handle cases where no match is found
                }
            }).filter(item => item !== null); // Remove null items if any
            const filteredselectedData = selectedData.filter((item: any) => item.Id !== "");
            setUpdateData(filteredselectedData);


            DetailsObj.forEach(detail => {
                if (detail.ID === 0) {
                    const matchingData = ToolboxIncidentDetailsData.find(data => data.ID === detail.ToolboxIncidentDetailsId);
                    if (matchingData) {
                        detail.UpdateID = matchingData.UpdateID;
                    }
                }
            });
            // const filteredMasterData = masterObj.filter(item => item.ID === 0);
            // const filteredData = DetailsObj.filter(item => item.ID === 0);
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
                ToolboxIncidentMasterId: Number(key),
                Comment: comments[key],
                IsShow: showToggles[key],
                SiteNameId: props?.originalSiteMasterId
            }));

            let DetailsObj = Object.keys(selectedToolBoxTalkStatus).map(key => ({
                ToolboxIncidentDetailsId: Number(key),
                Response: selectedToolBoxTalkStatus[key],
                SiteNameId: props?.originalSiteMasterId,
                ToolboxIncidentMasterId: null
            }));

            const existingIds = new Set(masterObj.map(item => item.ToolboxIncidentMasterId));
            const existingIds2 = new Set(DetailsObj.map(item => item.ToolboxIncidentDetailsId));
            ToolboxTalkData.forEach((item: any) => {
                if (!existingIds.has(item.ID)) {
                    masterObj.push({
                        ToolboxIncidentMasterId: Number(item.ID),
                        Comment: "",
                        IsShow: false,
                        SiteNameId: props?.originalSiteMasterId
                    });
                }
            });
            ToolboxIncidentDetailsData.forEach((item: any) => {
                if (!existingIds2.has(item.ID)) {
                    DetailsObj.push({
                        ToolboxIncidentDetailsId: Number(item.ID),
                        Response: "N/A",
                        SiteNameId: props?.originalSiteMasterId,
                        ToolboxIncidentMasterId: item.ToolboxIncidentMasterId
                    });
                }
            });

            DetailsObj.forEach(detail => {
                if (detail.ToolboxIncidentMasterId === null) {
                    const matchingData = ToolboxIncidentDetailsData.find(data => data.ID === detail.ToolboxIncidentDetailsId);
                    if (matchingData) {
                        detail.ToolboxIncidentMasterId = matchingData.ToolboxIncidentMasterId;
                    }
                }
            });

            setCreateData(masterObj);
            setCreateDetailsData(DetailsObj);
        }

    }, [showToggles, comments, selectedToolBoxTalkStatus, ToolboxIncidentDetailsData]);

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

    const _getToolboxIncident = () => {
        setIsLoading(true);
        try {
            const select = ["ID,IncidentDate,FormStatus,Subject,Location,CreatedDate,IsActive,SiteNameId,SiteName/Title,ChairpersonId,Chairperson/Title,Chairperson/Name,ReportId,Attendees,AttendeesEmailId,AttendeesEmail/Email,Attachments,AttachmentFiles,Created,MasterComment"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName", "Chairperson", "AttachmentFiles", "AttendeesEmail"],
                filter: `Id eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxIncident,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxIncident/Attachments/${data.ID}/`;
                        let attachmentFiledata: string[] = []; // Array to hold all attachment URLs
                        let creatorFileAttachments: string[] = []; // CreatorFile URLs
                        let masterFileAttachments: string[] = []; // MasterFile URLs

                        if (data.AttachmentFiles.length > 0) {
                            try {
                                data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                        attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                                        // Separate filtering based on FileName
                                        if (AttachmentData.FileName.includes("CreatorFile")) {
                                            creatorFileAttachments.push(AttachmentData.ServerRelativeUrl);
                                        } else if (AttachmentData.FileName.includes("MasterFile")) {
                                            masterFileAttachments.push(AttachmentData.ServerRelativeUrl);
                                        }
                                    } else if (AttachmentData && AttachmentData.FileName) {
                                        const fileUrl = fixImgURL + AttachmentData.FileName;
                                        attachmentFiledata.push(fileUrl);

                                        // Separate filtering based on FileName
                                        if (AttachmentData.FileName.includes("CreatorFile")) {
                                            creatorFileAttachments.push(fileUrl);
                                        } else if (AttachmentData.FileName.includes("MasterFile")) {
                                            masterFileAttachments.push(fileUrl);
                                        }
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
                                Title: data.Title,
                                MeetingDate: !!data.Created ? moment(data.Created).format(DateFormat) : '',
                                IncidentDate: !!data.IncidentDate ? moment(data.IncidentDate).format(DateFormat) : '',
                                CreatedDate: !!data.CreatedDate ? data.CreatedDate : new Date(),
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                ReportId: !!data.ReportId ? data.ReportId : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                Chairperson: !!data.ChairpersonId ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
                                AttendeesEmail: !!data.AttendeesEmailId ? data.AttendeesEmail.map((i: { ID: any; }) => i.ID) : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                Attachment: attachmentFiledata,
                                CreatorAttachment: creatorFileAttachments,
                                MasterAttachment: masterFileAttachments,
                                AttachmentFiles: data.AttachmentFiles,
                                MasterComment: !!data.MasterComment ? data.MasterComment : '',

                            }
                        );
                    });
                    //const strDate = moment(UsersListData[0]?.IncidentDate || UsersListData[0]?.MeetingDate).format(DateFormat);
                    setToday(UsersListData[0]?.IncidentDate || UsersListData[0]?.MeetingDate);
                    setGeneratedID(UsersListData[0]?.ReportId);
                    setChairPersonName(UsersListData[0]?.Chairperson);
                    setToolboxTalk(UsersListData[0]);
                    setMasterComment(UsersListData[0]?.MasterComment);
                    setSelectedEmployee(UsersListData[0]?.Attendees);
                    setMeetingLocation(UsersListData[0]?.Location);
                    setSubject(UsersListData[0]?.Subject);
                    setClientLookUp(UsersListData[0]?.AttendeesEmailId);
                    setAttachments(UsersListData[0]?.CreatorAttachment);
                    setmasterAttachments(UsersListData[0]?.MasterAttachment);
                    setListAttachmentsFiles(UsersListData[0]?.AttachmentFiles);
                    setSelectedSite(UsersListData[0]?.SiteNameId);
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

    const _getToolboxIncidentMaster = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SubTitle,DisplayOrder,SectionType,IsShow,IsComment,CommentTitle,IsDisplayBothTitle,IsDisplayToggle"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `IsShow eq 1`,
                listName: ListNames.ToolboxIncidentMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    if (!!results) {
                        const commentArray: any = {};
                        const UsersListData = results.map((data) => {
                            const matchingCommentData = AllMasterData?.filter(
                                (masterData) => masterData.ToolboxIncidentMasterId === data.ID
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
                                DisplayOrder: !!data.DisplayOrder ? data.DisplayOrder : 0,
                                SectionType: !!data.SectionType ? data.SectionType : '',
                                IsDisplayBothTitle: (data.IsDisplayBothTitle && data.IsDisplayBothTitle != null) ? data.IsDisplayBothTitle : false,
                                IsDisplayToggle: (data.IsDisplayToggle && data.IsDisplayToggle != null) ? data.IsDisplayToggle : false,
                                IsShow: isShow,
                                IsComment: (data.IsComment && data.IsComment != null) ? data.IsComment : false,
                                CommentTitle: !!data.CommentTitle ? data.CommentTitle : '',
                                UpdateID: UpdateID,
                                Comment: comment // Add Comment if match found
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
                                    DisplayOrder: !!data.DisplayOrder ? data.DisplayOrder : 0,
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
                const errorObj = { ErrorMethodName: "_ToolboxTalkData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_ToolboxTalkData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };


    const _getToolboxIncidentDetails = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,QuestionType,Response,ToolboxIncidentMasterId,ToolboxIncidentMaster/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxIncidentMaster"],
                listName: ListNames.ToolboxIncidentDetails,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    if (!!results) {
                        const UsersListData = results.map((data) => {
                            const matchingDetailsData = AllDetailData?.find(
                                (detailsDataItem) => detailsDataItem.ToolboxIncidentDetailsId === data.ID
                            );
                            const response = matchingDetailsData ? matchingDetailsData.Response : '';
                            const UpdateID = matchingDetailsData ? matchingDetailsData.ID : '';
                            return {
                                ID: data.ID,
                                Title: data.Title,
                                QuestionType: !!data.QuestionType ? data.QuestionType : '',
                                Response: response, // Updated response from DetailsData
                                ToolboxIncidentMasterId: !!data.ToolboxIncidentMasterId ? data.ToolboxIncidentMasterId : '',
                                ToolboxIncidentMaster: !!data.ToolboxIncidentMaster ? data.ToolboxIncidentMaster.Title : '',
                                UpdateID: UpdateID,
                                outputStatus: response // Add outputStatus field with the matched response
                            };
                        });
                        setToolboxIncidentDetailsData(UsersListData);
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
                                    ToolboxIncidentMasterId: !!data.ToolboxIncidentMasterId ? data.ToolboxIncidentMasterId : '',
                                    ToolboxIncidentMaster: !!data.ToolboxIncidentMaster ? data.ToolboxIncidentMaster.Title : '',
                                    outputStatus: "",
                                    UpdateID: 0,
                                }
                            );
                        });
                        setToolboxIncidentDetailsData(UsersListData);
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
    const _getToolboxIncidentMasterData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ToolboxIncidentMasterId,ToolboxIncidentMaster/Title,IsShow,Comment,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxIncidentMaster", "SiteName"],
                // filter: `IsShow eq 1 and MasterId eq '${props?.siteMasterId}'`,
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxIncidentMasterData,
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
                                ToolboxIncidentMasterId: !!data.ToolboxIncidentMasterId ? data.ToolboxIncidentMasterId : '',
                                ToolboxIncidentMaster: !!data.ToolboxIncidentMaster ? data.ToolboxIncidentMaster.Title : ''
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

    const _getToolboxIncidentDetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ToolboxIncidentDetailsId,ToolboxIncidentDetails/Title,Response,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxIncidentDetails", "SiteName"],
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxIncidentDetailsData,
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
                                ToolboxIncidentDetailsId: !!data.ToolboxIncidentDetailsId ? data.ToolboxIncidentDetailsId : '',
                                ToolboxIncidentDetails: !!data.ToolboxIncidentDetails ? data.ToolboxIncidentDetails.Title : ''
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

    const onDeleteFile = (FileName: any) => {
        props.provider.deleteAttachment(ListNames.ToolboxIncident, ToolboxTalk?.ID, FileName);
        const updatedAttachments = attachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        setAttachments(updatedAttachments);
        const updatedMasterAttachments = masterattachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        setmasterAttachments(updatedMasterAttachments);
    }

    const onDeleteTemplateAttachmentFile = (FileName: any) => {
        // provider.deleteAttachment(ListNames.IMSTemplateMaster, ToolboxTalk?.ID, FileName);
        const updatedAttachments = templateAttachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        const updatedAttach = ListAttachmentsFiles.filter((i: any) => { return i.FileName !== FileName });
        setTemplateAttachments(updatedAttachments);
        setListAttachmentsFiles(updatedAttach);
    }

    React.useEffect(() => {
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            _getToolboxIncidentMasterData();
            _getToolboxIncidentDetailsData();
        } else {
            _getToolboxIncidentMaster();
            _getToolboxIncidentDetails();
        }
    }, []);

    React.useEffect(() => {
        if (AllMasterData.length > 0)
            _getToolboxIncidentMaster();
    }, [AllMasterData]);

    React.useEffect(() => {
        if (AllDetailData.length > 0)
            _getToolboxIncidentDetails();
    }, [AllDetailData]);

    React.useEffect(() => {
        // Define an asynchronous function for the effect
        const fetchData = async () => {
            // Check if it's in update mode based on siteMasterId
            if (props?.componentProps?.siteMasterId && props.componentProps.siteMasterId > 0) {
                setUpdateItemId(props.componentProps.siteMasterId);
                setIsUpdate(true);
                _getToolboxIncident(); // Assuming this function is already async
            } else {
                // If not in edit mode, check for the template based on QCStateId
                const stateId = props?.breadCrumItems?.[0]?.manageCompomentItem?.dataObj?.QCStateId;

                if (stateId && stateId > 0) {
                    try {
                        const templateDetail = await _getIMSTemplateDetail(props.provider, props.context, stateId, 'Incident Report');
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

    const onClickSaveOrUpdate = async (type: string) => {
        //setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        let isValidForm = true;
        const IsCreateNewRecord = (type == "create") ? true : false;
        type = (type == "create") ? "submit" : type;
        let promiseCount: number = 0;
        let uploadedCount: number = 0;
        let progress: any = 0
        try {
            const error: any[] = [];
            if (!selectedSite || selectedSite == "") {
                isValidForm = false;
                error.push(<div>Site is required</div>);
            }
            if (!defaultManager || defaultManager == null) {
                isValidForm = false;
                error.push(<div>Incident recorded by is required</div>);
            }
            if (!selectedEmployee || selectedEmployee == null) {
                isValidForm = false;
                error.push(<div>Atleast one Attendee is required</div>);
            }
            if (MeetingLocation === "") {
                isValidForm = false;
                error.push(<div>Meeting Location is required</div>);
            }
            if (IsLimit) {
                isValidForm = false;
                error.push(<div>You can select a maximum 50 attendees.</div>);
            }
            if (!IsUpdate && (!CreateDetailsData || CreateDetailsData.length <= 0)) {
                isValidForm = false;
                error.push(<div>Please fill the form</div>);
            }

            if (!isValidForm) {
                //error = <ul><li>Please fill the form  </li></ul>;
                let errormessage = <><ul>{error.map((i: any) => {
                    return <li className="errorPoint">{i}</li>;
                })}</ul></>;
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValidForm, validationMessage: errormessage }));
                toastService.dismiss(toastId);
            } else {
                // setIsLoading(true);
                const uploadProgressData: any[] = [
                    { label: "Saving Incident Details", isLoading: true, key: "Incident" },
                    { label: "Uploding Files", isLoading: true, key: "Master" },
                ];

                setUploadProgress(uploadProgressData);
                const IncidentDate = moment(Today, DateFormat).toDate();
                if (IsUpdate && !IsCreateNewRecord) {
                    const toastMessage = 'Toolbox Incident has been updated successfully!';
                    const filterUpdateData = UpdateDetailsData.filter(x => x.Id > 0);//removeblank id's
                    // await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxIncidentDetailsData, filterUpdateData);
                    // await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxIncidentMasterData, UpdateData);
                    promiseCount = 5;
                    setIsShowProgressBar(true);

                    await Promise.all([
                        await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxIncidentDetailsData, filterUpdateData),
                        await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxIncidentMasterData, UpdateData),
                    ])
                    uploadedCount = 2;
                    progress = uploadedCount / promiseCount;
                    setPercentComplete(progress);
                    const currentDateDate = new Date();
                    const ToolBoxTalkData = {
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        Attendees: !!selectedEmployee ? selectedEmployee : "",
                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                        IncidentDate: IncidentDate.toISOString(),
                        FormStatus: type,
                        Location: !!MeetingLocation ? MeetingLocation : "",
                        Subject: !!Subject ? Subject : "",
                        MasterComment: !!MasterComment ? MasterComment : "",
                        IsSendEmail: (type == "submit" && ToolboxTalk?.FormStatus == "draft") ? true : false
                    };

                    await props.provider.updateItemWithPnP(ToolBoxTalkData, ListNames.ToolboxIncident, UpdateItemId);
                    setUploadProgress(prev =>
                        prev.map(item =>
                            item.key === "Incident"
                                ? { ...item, isLoading: false }
                                : item
                        )
                    );
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.IncidentReport,
                        EntityId: UpdateItemId,
                        EntityName: GeneratedID,
                        Details: `Update Toolbox Incident`,
                        StateId: props?.componentProps?.qCStateId,
                        LogFor: UserActionLogFor.Both,
                    };
                    uploadedCount = 3;
                    progress = uploadedCount / promiseCount;
                    setPercentComplete(progress);
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    // if (selectedFiles.length > 0) {
                    //     setIsLoading(true);
                    //     await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, selectedFiles, UpdateItemId)
                    //         .then((results: any[]) => {
                    //             console.log("All files uploaded successfully");

                    //         })
                    //         .catch((error: any) => {
                    //             console.error("Failed to upload files", error);
                    //             setIsLoading(false);
                    //         });
                    // }
                    // if (masterFiles.length > 0) {
                    //     setIsLoading(true);
                    //     await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, masterFiles, UpdateItemId)
                    //         .then((results: any[]) => {
                    //             console.log("All master files uploaded successfully");
                    //             toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    //             setIsLoading(false);
                    //         })
                    //         .catch((error: any) => {
                    //             console.error("Failed to upload master files", error);
                    //             setIsLoading(false);
                    //         });
                    // }

                    try {
                        await Promise.all([
                            selectedFiles.length > 0
                                ? props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, selectedFiles, UpdateItemId)
                                : Promise.resolve(),
                            masterFiles.length > 0
                                ? props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, masterFiles, UpdateItemId)
                                : Promise.resolve(),
                        ]);

                        toastService.updateLoadingWithSuccess(toastId, "Files uploaded successfully!");
                    } catch (error) {
                        console.error("File upload failed:", error);
                        toastService.showError(toastId, "Some files failed to upload. Please try again.");
                    } finally {
                        // setIsLoading(false);
                        uploadedCount = 5;
                        progress = uploadedCount / promiseCount;
                        setUploadProgress(prev =>
                            prev.map(item =>
                                item.key === "Master"
                                    ? { ...item, isLoading: false }
                                    : item
                            )
                        );
                        setPercentComplete(progress);
                    }

                    setIsShowProgressBar(false);
                    setTimeout(() => {
                        onClickClose()
                        // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                        // props.manageComponentView({
                        //     currentComponentName: ComponentNameEnum.AddNewSite, isReload: true, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
                        // });
                        // setIsLoading(false);
                    }, 1000);

                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {
                    const uploadProgressData: any[] = [
                        { label: "Saving Incident Details", isLoading: true, key: "Incident" },
                        { label: "Uploding Files", isLoading: true, key: "Master" },
                        { label: "Generating PDF", isLoading: true, key: "PDF" },
                    ];
                    promiseCount = 13;
                    uploadedCount = 0;
                    progress = 0;
                    // setIsLoading(true);
                    let isValid = true;
                    let createdId: number = 0;
                    let createdCARId: number = 0;
                    let newID = GeneratedID.replace("IRF", "CAR");
                    if (isValid) {
                        const toastMessage = 'Toolbox Incidents has been added successfully!';
                        const ToolBoxTalkData = {
                            Title: !!GeneratedID ? GeneratedID : "",
                            ReportId: !!GeneratedID ? GeneratedID : "",
                            ChairpersonId: [defaultManager],
                            SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            Attendees: !!selectedEmployee ? selectedEmployee : "",
                            AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                            IncidentDate: IncidentDate.toISOString(),
                            FormStatus: type,
                            Location: !!MeetingLocation ? MeetingLocation : "",
                            Subject: !!Subject ? Subject : "",
                            MasterComment: MasterComment,
                            CreatedDate: (IsUpdate) ? ToolboxTalk?.CreatedDate ?? new Date() : new Date(),
                            HistoryId: (IsUpdate) ? UpdateItemId : null,
                            IsSendEmail: (type == "submit") ? true : false
                        };
                        setIsShowProgressBar(true);
                        await props.provider.createItem(ToolBoxTalkData, ListNames.ToolboxIncident).then(async (item: any) => {
                            createdId = item.data.Id;
                            setUploadProgress(uploadProgressData.map(item =>
                                item.key === "Incident"
                                    ? { ...item, isLoading: false }
                                    : item
                            )
                            );
                            uploadedCount = 1;
                            progress = uploadedCount / promiseCount;
                            setPercentComplete(progress);
                            setToolboxIncidentId(Number(createdId));

                            await getCorrectiveId(props.provider, Number(UpdateItemId));
                            uploadedCount = 2;
                            progress = uploadedCount / promiseCount;
                            setPercentComplete(progress);
                            // Start Corrective action code
                            const ReportDate = moment(Today, DateFormat).toDate();
                            const currentDateDate = new Date();
                            const objCARData = {
                                Title: !!newID ? newID : "",
                                Location: !!MeetingLocation ? MeetingLocation : "",
                                Subject: !!Subject ? Subject : "",
                                ReportId: !!newID ? newID : "",
                                ChairpersonId: [defaultManager],
                                SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                                Attendees: !!selectedEmployee ? selectedEmployee : "",
                                AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                                ReportDate: ReportDate.toISOString(),
                                FormStatus: 'draft',
                                CreatedDate: new Date(),
                                HistoryId: null,
                                IsSendEmail: false,
                                IncidentReportId: Number(createdId)

                            };
                            await props.provider.createItem(objCARData, ListNames.CorrectiveActionReport).then(async (item: any) => {
                                uploadedCount = 3;
                                progress = uploadedCount / promiseCount;
                                setPercentComplete(progress);
                                createdCARId = item.data.Id;
                                if (createdCARId > 0) {
                                    let updatedCreateDataCAR: any;
                                    let updatedCreateDetailsDataCAR: any;
                                    const IncidentDescription = CreateData?.find(item => item.ToolboxIncidentMasterId === 3)?.Comment || "";
                                    const NatureofInjury = CreateData?.find(item => item.ToolboxIncidentMasterId === 11)?.Comment || "";

                                    const NameoffirstAider = CreateDetailsData?.find(item => item.ToolboxIncidentDetailsId === 79)?.Response || "";


                                    updatedCreateDataCAR = CreateDataCAR?.map((item: any) => {
                                        let comment = item.Comment; // Keep original unless matched

                                        switch (item.CorrectiveActionReportMasterId) {
                                            case 2:
                                                comment = IncidentDescription;
                                                break;
                                            case 4:
                                                comment = NatureofInjury;
                                                break;
                                        }

                                        return {
                                            ...item,
                                            MasterId: createdCARId,
                                            CorrectiveActionReportId: createdCARId,
                                            Comment: comment
                                        };
                                    });

                                    updatedCreateDetailsDataCAR = CreateDetailsDataCAR?.map((item: any) => {
                                        let response = item.Response; // Keep original unless matched

                                        switch (item.CorrectiveActionReportDetailsId) {
                                            case 6:
                                                response = "";
                                                break;
                                            case 1:
                                                response = selectedManager;
                                                break;
                                            case 12:
                                                response = NameoffirstAider;
                                                break;
                                        }

                                        return {
                                            ...item,
                                            MasterId: createdCARId,
                                            Response: response
                                        };
                                    });


                                    await Promise.all([
                                        props.provider.createItemInBatch(updatedCreateDataCAR, ListNames.CorrectiveActionReportMasterData),
                                        props.provider.createItemInBatch(updatedCreateDetailsDataCAR, ListNames.CorrectiveActionReportDetailsData),
                                    ])
                                    uploadedCount = 5;
                                    progress = uploadedCount / promiseCount;
                                    setPercentComplete(progress);
                                }

                            }).catch(err => console.log(err));

                            // End Corrective action code
                            const logObj = {
                                UserName: props?.loginUserRoleDetails?.title,
                                SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                                ActionType: UserActivityActionTypeEnum.Create,
                                EntityType: UserActionEntityTypeEnum.IncidentReport,
                                EntityId: Number(createdId),
                                EntityName: GeneratedID,
                                Details: `Add Toolbox Incident`,
                                LogFor: UserActionLogFor.Both,
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
                                        ToolboxIncidentId: createdId
                                    }));
                                    updatedCreateDetailsData = CreateDetailsData.map((item: any) => ({
                                        ...item,
                                        MasterId: createdId
                                    }));
                                } else {
                                    updatedCreateData = CreateData.map(({ UpdateID, ID, ...rest }: any) => ({
                                        //const matchingItem = CreateData.find(toolbox => toolbox.ToolboxIncidentMasterId === master.ToolboxIncidentMasterId);
                                        ...rest,
                                        MasterId: createdId,
                                        ToolboxIncidentId: createdId
                                    }));

                                    updatedCreateDetailsData = CreateDetailsData.map(({ UpdateID, ID, ...rest }: any) => ({
                                        ...rest,
                                        MasterId: createdId
                                    }));


                                    //Inactive previous record
                                    const toolBoxInactive = {
                                        IsActive: false
                                    };
                                    await props.provider.updateItemWithPnP(toolBoxInactive, ListNames.ToolboxIncident, UpdateItemId);
                                    uploadedCount = 6;
                                    progress = uploadedCount / promiseCount;
                                    setPercentComplete(progress);
                                }

                                await Promise.all([
                                    props.provider.createItemInBatch(updatedCreateData, ListNames.ToolboxIncidentMasterData),
                                    props.provider.createItemInBatch(updatedCreateDetailsData, ListNames.ToolboxIncidentDetailsData)
                                ])
                                uploadedCount = 8;
                                progress = uploadedCount / promiseCount;
                                setPercentComplete(progress);
                                if (ListAttachmentsFiles && ListAttachmentsFiles.length > 0) {
                                    for (const attachment of ListAttachmentsFiles) {
                                        await uploadAttachment(attachment, createdId);
                                    }
                                }
                                uploadedCount = 9;
                                progress = uploadedCount / promiseCount;
                                setPercentComplete(progress);
                                setUploadProgress(prev =>
                                    prev.map(item =>
                                        item.key === "Master"
                                            ? { ...item, isLoading: false }
                                            : item
                                    )
                                );



                                // if (masterFiles.length > 0) {
                                //     setIsLoading(true);
                                //     await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, masterFiles, createdId)
                                //         .then((results: any[]) => {
                                //             console.log("All master files uploaded successfully");
                                //             // toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                //         })
                                //         .catch((error: any) => {
                                //             console.error("Failed to upload master files", error);
                                //             setIsLoading(false);
                                //         });
                                // }

                                // if (selectedFiles.length > 0) {
                                //     setIsLoading(true);
                                //     await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, selectedFiles, createdId)
                                //         .then((results: any[]) => {
                                //             console.log("All files uploaded successfully");
                                //         })
                                //         .catch((error: any) => {
                                //             console.error("Failed to upload files", error);
                                //             setIsLoading(false);
                                //         });

                                // }
                                try {
                                    // ✅ Start loading once before uploads
                                    // setIsLoading(true);

                                    // ✅ Run both uploads in parallel (only if files exist)
                                    await Promise.all([
                                        masterFiles.length > 0
                                            ? props.provider
                                                .uploadAttachmentsToListSequential(ListNames.ToolboxIncident, masterFiles, createdId)
                                                .then(() => {
                                                    console.log("All master files uploaded successfully");
                                                })
                                            : Promise.resolve(),

                                        selectedFiles.length > 0
                                            ? props.provider
                                                .uploadAttachmentsToListSequential(ListNames.ToolboxIncident, selectedFiles, createdId)
                                                .then(() => {
                                                    console.log("All selected files uploaded successfully");
                                                })
                                            : Promise.resolve(),
                                    ]);
                                    console.log("All uploads completed successfully");


                                } catch (error) {
                                    console.error("One or more uploads failed:", error);
                                    toastService.showError(toastId, "File upload failed. Please try again.");
                                } finally {
                                    uploadedCount = 11;
                                    progress = uploadedCount / promiseCount;
                                    setPercentComplete(progress);
                                    // setIsLoading(false);
                                }
                                toastService.updateLoadingWithSuccess(toastId, "Toolbox Incidents has been added successfully!");
                                // setIsLoading(true);
                                setIsToolboxPDFGenerating(true);

                                setTimeout(async () => {
                                    let fileName: string = props?.componentProps?.siteName + '-Incident Report';
                                    let fileBlob: any = await generateAndSaveKendoPDF("DetailToolboxIncidentPDFCode", fileName, false);
                                    uploadedCount = 12;
                                    progress = uploadedCount / promiseCount;
                                    setPercentComplete(progress);
                                    const file: IFileWithBlob[] = [{
                                        file: fileBlob,
                                        name: `${fileName}.pdf`,
                                        overwrite: true
                                    }];
                                    try {
                                        if (!!file && file.length > 0) {
                                            await props.provider.deleteAttachmentIfAvailable(ListNames.ToolboxIncident, createdId, `${fileName}.pdf`)

                                            await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxIncident, file, createdId)
                                                .then((results: any[]) => {
                                                    console.log("PDF generated files uploaded successfully");
                                                    // toastService.updateLoadingWithSuccess(toastId, "PDF generated successfully");
                                                    // setIsLoading(false);
                                                })
                                                .catch((error: any) => {
                                                    console.error("Failed to upload PDF generated", error);
                                                    // setIsLoading(false);
                                                });

                                        }
                                        uploadedCount = 13;
                                        progress = uploadedCount / promiseCount;
                                        setPercentComplete(progress);
                                        // setIsLoading(false);
                                        setIsShowProgressBar(false);
                                        toastService.updateLoadingWithSuccess(toastId, "PDF generated successfully");
                                        onClickClose()
                                        // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        // props.manageComponentView({
                                        //     currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
                                        // });
                                    } catch (error) {
                                        console.log(error);
                                        setUploadProgress(prev =>
                                            prev.map(item =>
                                                item.key === "PDF"
                                                    ? { ...item, isLoading: false }
                                                    : item
                                            )
                                        );

                                        setIsLoading(false);
                                        setIsShowProgressBar(false);
                                    }


                                }, 1000);

                            }

                        }).catch(err => console.log(err));
                        // setIsLoading(false);
                    } else {
                        toastService.dismiss(toastId);
                        // setIsLoading(false);
                        setIsShowProgressBar(false);
                    }
                    // setIsLoading(false);
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
        setMasterComment(TemplateDetail.MasterComment);
        setTemplateAttachments(TemplateDetail.CreatorAttachment);
        setListAttachmentsFiles(TemplateDetail.AttachmentFiles);
        if (IMSTemplateToolboxIncidentMasterData && IMSTemplateToolboxIncidentMasterData.length > 0) {
            const commentArray: any = {};
            const defaultToggles: any = {};
            IMSTemplateToolboxIncidentMasterData.forEach((item: any) => {
                commentArray[item.ToolboxIncidentMasterId] = item.Comment;
                defaultToggles[item.ToolboxIncidentMasterId] = item.IsShow;
            });
            setComments(commentArray);
            setShowToggles(defaultToggles);
        }
        if (IMSTemplateToolboxIncidentDetailsData && IMSTemplateToolboxIncidentDetailsData.length > 0) {
            const selectedStatus: any = {};
            IMSTemplateToolboxIncidentDetailsData.forEach((item: any) => {
                selectedStatus[item.ToolboxIncidentDetailsId] = item.Response
            });
            setSelectedToolBoxTalkStatus(selectedStatus);
        }
        hideTemplatePopup();
    }

    const onClickNoLoadTemplateData = () => {
        hideTemplatePopup();
    }


    const handleRichTextChangemaster = (newValue: string) => {
        setMasterComment(newValue); // Update state with the new comment value
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
                    setCorrectiveActionReportData(UsersListData);
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
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };
    const onClickClose = () => {
        if (isSiteLevelComponent) {
            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            // props.manageComponentView({
            //     currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
            // });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "IMSKey",
                subpivotName: "ToolboxIncident",
            });
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "ToolboxIncident", selectedZoneDetails: props.componentProps.selectedZoneDetails });
        }
    };

    React.useEffect(() => {
        let showToggle: any = {
            "1": true,
            "2": true,
            "3": false,
            "4": true,
            "5": false,
            "6": true,
            "7": false
        }
        const masterObj = Object.keys(showToggle).map(key => ({
            CorrectiveActionReportMasterId: Number(key),
            Comment: comments[key] || "",
            IsShow: showToggle[key],
            SiteNameId: Number(props?.originalSiteMasterId)

        }));

        let DetailsObj = Object.keys(selectedToolBoxTalkStatus).map(key => ({
            CorrectiveActionReportDetailsId: Number(key),
            Response: selectedToolBoxTalkStatus[key],
            SiteNameId: Number(props?.originalSiteMasterId),
            CorrectiveActionReportMasterId: null
        }));

        const existingIds = new Set(masterObj.map(item => item.CorrectiveActionReportMasterId));
        const existingIds2 = new Set(DetailsObj.map(item => item.CorrectiveActionReportDetailsId));
        CorrectiveActionReportData.forEach((item: any) => {
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
        setCreateDataCAR(masterObj);
        setCreateDetailsDataCAR(DetailsObj);
    }, [comments, selectedToolBoxTalkStatus, CorrectiveActionReportDetailsData]);

    return <>
        {isLoading && <Loader />}
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        {isShowProgressBar && <div className="progressBarLoader">
            <div>
                <div className="progress-Content-text">
                    <div>
                        <h2 className="mt-10">Saving Items</h2>
                        <ul className="mt-10">
                            {uploadProgress.length > 0 &&
                                uploadProgress.map((i) => {
                                    return <li className="errorPoint"> {i.label}  {i.isLoading ? <span className="ml-10"><FontAwesomeIcon className="quickImg spinerWhite" icon={"spinner"} spin /></span> : <span className="ml-10"><FontAwesomeIcon className="quickImg spinerWhite" icon={faSquareCheck} /></span>}</li>
                                })}
                        </ul>
                    </div>
                </div>
                <div className="progress-fileUploadNew">
                    <div className="progress-Content">
                        <ProgressIndicator label={`Incident Report Saving in Progress: ${!!percentComplete ? ((percentComplete * 100).toFixed(2)) : 0}% `}
                            description={`Please wait - do not refresh.`}
                            ariaValueText="Saving Items"
                            barHeight={10}
                            percentComplete={percentComplete}
                        />
                    </div>
                </div>
            </div>
        </div>

        }

        <div className="mt-10">
            <div className="ms-Grid ">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
                            <div className="formGroup btnSticky-incident">
                                <div className="va-b inlineBlock">
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"

                                        onClick={onClickClose
                                            // () => {
                                            //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            //     props.manageComponentView({
                                            //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
                                            //     })
                                            // }
                                        }
                                    />
                                </div>
                            </div>
                            <div className="">
                                <div className={window.innerWidth <= 768 ? "asset-card-2-header-jcc-2 boxCard incident-pad margin-bot-80" : "asset-card-2-header-jcc-2 boxCard margin-bot-80"}>
                                    <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                        <tr>
                                            <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                            <td className="td-toolbox-talk middle-box"><div>NCR & Incident Report</div></td>
                                            <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-CP-08-F2</div></td>
                                        </tr>
                                    </table>
                                    <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">NCR and Incident Report: {GeneratedID}</div></div></div>
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
                                                        : moment(Today, DateFormat).toDate()}
                                                    onSelectDate={(date?: Date) => {
                                                        if (date !== undefined) {
                                                            const strDate = moment(date).format(DateFormat);
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
                                            {isVisibleCrud.current ?
                                                <td className="td-toolbox-talk"><b>Job Site: <span className="required">*</span></b></td>
                                                :
                                                <td className="td-toolbox-talk"><b>Job Site:</b></td>
                                            }
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
                                                </td> :
                                                <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}
                                                </td>
                                            }
                                        </tr>
                                        <tr>
                                            {IsUpdate ?
                                                <td className="td-toolbox-talk"><b>Location:</b></td> :
                                                <td className="td-toolbox-talk"><b>Location:<span className="required"> *</span></b></td>}
                                            <td className="td-toolbox-talk">
                                                <IMSLocationCommonFilter
                                                    onIMSLocationChange={onIMSLocationChange}
                                                    provider={props.provider}
                                                    selectedIMSLocation={MeetingLocation}
                                                    defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                    siteNameId={selectedSite || props.originalSiteMasterId}
                                                    Title="Toolbox Incident"
                                                    Label="Location"
                                                    placeHolder="Select Location"
                                                    IsUpdate={IsUpdate}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="td-toolbox-talk">Incident recorded by:</th>
                                            {ManagerOptions && IsUpdate === false ?
                                                <td className="td-toolbox-talk">
                                                    <ReactDropdown
                                                        options={ManagerOptions} isMultiSelect={false}
                                                        defaultOption={defaultManager || selectedManager}
                                                        onChange={_onManagerChange}
                                                        isClearable={true}
                                                        isDisabled={selectedSite == "" || selectedSite == null}
                                                        placeholder={"Select Incident recorded by"} />
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
                                            <th className="td-toolbox-talk">Incident reported by:</th>
                                            <td className="td-toolbox-talk add-max-width">
                                                <AddOtherEmployee
                                                    onEmployeeChange={onEmployeeChange}
                                                    provider={props.provider}
                                                    // StateId={SiteData[0]?.StateId}
                                                    StateId={StateId}
                                                    isDisabled={StateId !== undefined ? false : false}
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
                                        {ToolboxTalkData.map((mainItem: any) => {
                                            const detailItemList = ToolboxIncidentDetailsData.filter(
                                                (detail: any) => detail.ToolboxIncidentMasterId === mainItem.ID
                                            );

                                            if (detailItemList.length > 0) {
                                                const isMainTitle = !mainItem.SubTitle || mainItem.IsDisplayBothTitle;
                                                const isSubTitle = (!!mainItem.SubTitle) && !mainItem.IsDisplayBothTitle;
                                                const titleText = isMainTitle ? mainItem.Title : mainItem.SubTitle;
                                                const titleClass = isMainTitle ? "main-header-text mt-3 dflex" : "sub-main-header-text mt-2 dflex";
                                                const isDisplayTitle = (titleText == "Basic Detail") ? false : true;
                                                const isDisplayToggle = (mainItem.IsDisplayBothTitle) ? false : true;

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
                                                                            /> :
                                                                            <Toggle
                                                                                checked={showToggles[mainItem.ID] ?? false}
                                                                                onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                                onText="Yes"
                                                                                offText="No"
                                                                                className="mt-2"
                                                                            />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {(mainItem.IsDisplayBothTitle == true || isSubTitle) && (
                                                            <div className="sub-main-header-text mt-2 dflex">
                                                                {mainItem.SubTitle}

                                                                <div className="toggle-class">
                                                                    {IsUpdate && (ToolboxTalk && ToolboxTalk?.FormStatus !== "draft") ?
                                                                        <Toggle
                                                                            checked={showToggles[mainItem.ID] ?? false}
                                                                            onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                            onText="Yes"
                                                                            offText="No"
                                                                            className="mt-2"
                                                                        // disabled
                                                                        /> :
                                                                        <Toggle
                                                                            checked={showToggles[mainItem.ID] ?? false} // Ensure a fallback to false if undefined
                                                                            onChange={(e, checked) => handleToggleChange(mainItem.ID, checked)}
                                                                            onText="Yes"
                                                                            offText="No"
                                                                            className="mt-2"
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
                                                                                                                value={detailItem.ID in selectedToolBoxTalkStatus ? selectedToolBoxTalkStatus[detailItem.ID] : detailItem.outputStatus}
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

                                                                        {mainItem.SubTitle === "Nature/Extent of Damage" && (
                                                                            <div className="mt-1">
                                                                                <div>
                                                                                    <ul>
                                                                                        {!!attachments && attachments?.length > 0 && attachments?.map((filePath: any, index: any) => {
                                                                                            const fileName = filePath.split('/').pop();
                                                                                            return (
                                                                                                <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                    <span>{fileName}</span>
                                                                                                    <FontAwesomeIcon icon="trash-alt" style={{ marginLeft: '10px' }} className="ml5 dlticonDoc tooltipcls required" onClick={() => onDeleteFile(fileName)} />
                                                                                                </li>
                                                                                            );
                                                                                        })}
                                                                                    </ul>
                                                                                </div>

                                                                                <div>
                                                                                    <ul>
                                                                                        {!IsUpdate && !!templateAttachments && templateAttachments?.length > 0 && templateAttachments?.map((filePath: any, index: any) => {

                                                                                            const fileName = filePath.split('/').pop();
                                                                                            return (
                                                                                                <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                    <span>{fileName}</span>
                                                                                                    <FontAwesomeIcon icon="trash-alt" style={{ marginLeft: '10px' }} className="ml5 dlticonDoc tooltipcls required" onClick={() => onDeleteTemplateAttachmentFile(fileName)} />

                                                                                                </li>
                                                                                            );
                                                                                        })}
                                                                                    </ul>
                                                                                </div>

                                                                                <TextField type="file"
                                                                                    multiple={fileattachment.isMultipleFiles}
                                                                                    onChange={fileSelectionChange}
                                                                                    name="Files"
                                                                                    className='FileUpload mt-1' />
                                                                            </div>
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

                                    <>
                                        <div className="mt-2">
                                            <ul>
                                                {!!masterattachments && masterattachments?.length > 0 && masterattachments?.map((filePath: any, index: any) => {
                                                    const fileName = filePath.split('/').pop();
                                                    return (
                                                        <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span>{fileName}</span>
                                                            <FontAwesomeIcon icon="trash-alt" style={{ marginLeft: '10px' }} className="ml5 dlticonDoc tooltipcls required" onClick={() => onDeleteFile(fileName)} />
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                        <div className="pdf-lbl-talk"><b>Upload File</b></div>
                                        <div className="mt-1">
                                            <TextField type="file"
                                                multiple={true}
                                                onChange={MasterFileSelectionChange}
                                                name="Files"
                                                className='FileUpload mt-1' />
                                        </div>
                                    </>

                                    <>
                                        <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
                                        <div className="mt-1">
                                            <RichText
                                                value={MasterComment || ""} // Existing value from state
                                                onChange={(text: any) => handleRichTextChangeMaster(text)}
                                                isEditMode={true}
                                                placeholder="Enter Event Description"
                                            />

                                        </div>
                                    </>



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
                                                    // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                                    // props.manageComponentView({
                                                    //     currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
                                                    // });
                                                    onClickClose()
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
        {isToolboxPDFGenerating &&
            <div className="mt-10">
                <DetailToolboxIncident
                    loginUserRoleDetails={props.componentProps.loginUserRoleDetails}
                    provider={props.provider}
                    context={props.context}
                    isAddNewHelpDesk={props.componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={toolboxIncidentId || props.componentProps.siteMasterId}
                    breadCrumItems={props.componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={props.componentProps.originalSiteMasterId}
                />
            </div>
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
                                <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>)
        }

        {
            isTemplatePopupVisible && (
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