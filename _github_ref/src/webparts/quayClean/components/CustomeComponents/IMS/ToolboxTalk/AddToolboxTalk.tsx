/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChoiceGroup, DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { _getIMSTemplateDetail, _siteData, getCurrentDateTimeStamp, logGenerator, mapSingleValue, onFormatDate, removeElementOfBreadCrum, UserActivityLog } from "../../../../../../Common/Util";
import { DataType } from "../../../../../../Common/Constants/CommonConstants";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import SuccessComponent from "../../../CommonComponents/SuccessComponent";
import { AddOtherEmployee } from "../../../../../../Common/AddOtherEmployee";
import { useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { attendeeOptions, DateFormat } from "../../../../../../Common/Constants/CommonConstants";
import CamlBuilder from "camljs";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { IMSLocationCommonFilter } from "../../../../../../Common/Filter/IMSLocationCommonFilter";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
const imgLogo = require('../../../../assets/images/logo.png');
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];


export const AddToolboxTalk: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isVisibleCrud = React.useRef<boolean>(false);
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
    const [StateId, setStateId] = React.useState<string>("");
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Subject, setSubject] = React.useState<string>("");
    const [Minutestakenandrecordedby, setMinutestakenandrecordedby] = React.useState<string>("");
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

    // This States are using for the Shift Type Control
    const [shiftTypeOptions, setShiftTypeOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultShiftType, setDefaultShiftType] = React.useState<string>("");
    const [selectedShiftType, setSelectedShiftType] = React.useState<any>();

    // on Shit Type DropDown value change
    const _onShiftTypeChange = (option: any): void => {
        setSelectedShiftType(option?.text);
        setDefaultShiftType(option?.value);
    };

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

    const initialToggles = ToolboxTalkData.reduce((acc, item) => {
        acc[item.ID] = false;
        return acc;
    }, {});

    const [showToggles, setShowToggles] = React.useState<any>(initialToggles);

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
            // window.open('');
            setIsComponentClosed(true);
        } else {
            if (isSiteLevelComponent) {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: "ToolboxTalk",
                });
            } else {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "ToolboxTalk", selectedZoneDetails: props.componentProps.selectedZoneDetails });
            }
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
    // const _siteData = () => {
    //     try {
    //         let filter = "";
    //         if (props.isForm && (selectedSite !== "" || selectedSite !== undefined)) {
    //             filter = `ID eq ${selectedSite}`;
    //         } else {
    //             filter = `ID eq ${props?.originalSiteMasterId}`;
    //         }
    //         const select = ["ID,Title,SiteManagerId,SiteManager/Title,SiteManager/Name,SiteManager/EMail,QCStateId,Category"];
    //         const expand = ["SiteManager"];
    //         const queryStringOptions: IPnPQueryOptions = {
    //             select: select,
    //             expand: expand,
    //             filter: filter,
    //             listName: ListNames.SitesMaster,
    //         };

    //         props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
    //             if (!!results) {
    //                 const SiteData: any = results.map((data) => {
    //                     return (
    //                         {
    //                             ID: data.ID,
    //                             Title: data.Title,
    //                             SiteManagerId: data.SiteManagerId,
    //                             SiteManagerName: !!data.SiteManagerId ? data.SiteManager.map((i: { Title: any; }) => i.Title) : '',
    //                             SiteManagerEmail: !!data.SiteManager ? data.SiteManager.map((i: { EMail: any; }) => i.EMail) : '',
    //                             StateId: !!data.QCStateId ? data.QCStateId : null
    //                         }
    //                     );
    //                 });
    //                 setSiteData(SiteData);
    //             }
    //         }).catch((error) => {
    //             console.log(error);
    //             setIsLoading(false);
    //         });
    //     } catch (ex) {
    //         console.log(ex);
    //     }
    // };

    const _getIMSTemplateToolboxTalkMasterData = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "ToolboxTalkMasterId", "ToolboxTalkMaster/Id", "ToolboxTalkMaster/Title",
                "Comment", "MasterId", "IsShow"
            ];
            const expand = ["ToolboxTalkMaster"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateToolboxTalkMasterData,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                ToolboxTalkMasterId: data.ToolboxTalkMasterId ?? 0,
                Comment: data.Comment ?? '',
                MasterId: data.MasterId ?? 0,
                IsShow: data.IsShow ?? false,
            })) || [];
        } catch (error) {
            console.error("Error fetching IMSTemplateToolboxTalkMasterData:", error);
            setIsLoading(false);
        }
    };
    const _getIMSTemplateToolboxTalk = async (masterId: number) => {
        try {
            const select = [
                "ID", "Title", "ToolboxTalkDetailsId", "ToolboxTalkDetails/Id", "ToolboxTalkDetails/Title",
                "ToolboxTalkMasterId", "ToolboxTalkMaster/Id", "ToolboxTalkMaster/Title", "Response", "MasterId"
            ];
            const expand = ["ToolboxTalkDetails", "ToolboxTalkMaster"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                expand,
                filter: `MasterId eq ${masterId}`,
                listName: ListNames.IMSTemplateToolboxTalk,
            };

            const results = await props.provider.getItemsByQuery(queryStringOptions);
            return results?.map(data => ({
                ID: data.ID,
                Title: data.Title,
                ToolboxTalkDetailsId: data.ToolboxTalkDetailsId ?? 0,
                ToolboxTalkMasterId: data.ToolboxTalkMasterId ?? 0,
                Response: data.Response ?? '',
                MasterId: data.MasterId ?? '',
            })) || [];
        } catch (error) {
            console.error("Error fetching IMSTemplateToolboxTalk data:", error);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (TemplateDetail?.ID) {
                try {
                    const [IMSTemplateToolboxTalkMasterData, IMSTemplateToolboxTalk] = await Promise.all([
                        _getIMSTemplateToolboxTalkMasterData(TemplateDetail.ID),
                        _getIMSTemplateToolboxTalk(TemplateDetail.ID)
                    ]);

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
        setSelectedSite(props?.originalSiteMasterId);
        _getShiftTypeChoices();
        let isVisibleCrud1 = (currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;

        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
        let SM = props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM;
        const formattedDate = moment().format('DD-MM-YYYY');
        setToday(formattedDate);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const id = `IBM-${uniquePart}`;
        setGeneratedID(id);
    }, []);

    const loadSiteSitesMasterData = async () => {
        setIsLoading(true);
        const { SiteData, StateId } = await _siteData(props.provider, selectedSite);
        setSiteData(SiteData);
        setStateId(StateId);
        setIsLoading(false);
    };

    React.useEffect(() => {
        loadSiteSitesMasterData();
    }, [selectedSite]);

    React.useEffect(() => {
        if (!selectedSite && selectedZoneDetails?.defaultSelectedSitesId?.length === 1) {
            setSelectedSite(selectedZoneDetails.defaultSelectedSitesId[0]);
        }
    }, [selectedZoneDetails]);

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


    const _ToolboxTalkData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,IsShow,IsComment"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `IsShow eq 1`,
                listName: ListNames.ToolboxTalkMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    if (!!results) {
                        const commentArray: any = {};
                        const UsersListData = results.map((data) => {
                            const matchingCommentData = AllMasterData?.filter(
                                (masterData) => masterData.ToolboxTalkMasterId === data.ID
                            );
                            const isShow = matchingCommentData.length > 0 && matchingCommentData[0].IsShow === true;
                            const comment = matchingCommentData.length > 0 ? matchingCommentData[0].Comment : '';
                            const UpdateID = matchingCommentData.length > 0 ? matchingCommentData[0].ID : '';
                            if (UpdateID) {
                                commentArray[data.ID] = comment;
                            }
                            return {
                                ID: data.ID,
                                Title: data.Title,
                                IsShow: isShow,
                                IsComment: !!data.IsComment ? data.IsComment : '',
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
                                    IsShow: !!data.IsShow ? data.IsShow : '',
                                    IsComment: !!data.IsComment ? data.IsComment : '',
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


    const _ToolboxTalkDetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Response,ToolboxTalkMasterId,ToolboxTalkMaster/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxTalkMaster"],
                listName: ListNames.ToolboxTalkDetails,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    if (!!results) {
                        const UsersListData = results.map((data) => {
                            const matchingDetailsData = AllDetailData?.find(
                                (detailsDataItem) => detailsDataItem.ToolboxTalkDetailsId === data.ID
                            );
                            const response = matchingDetailsData ? matchingDetailsData.Response : '';
                            const UpdateID = matchingDetailsData ? matchingDetailsData.ID : '';
                            return {
                                ID: data.ID,
                                Title: data.Title,
                                Response: response, // Updated response from DetailsData
                                ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : '',
                                ToolboxTalkMaster: !!data.ToolboxTalkMaster ? data.ToolboxTalkMaster.Title : '',
                                UpdateID: UpdateID,
                                outputStatus: response // Add outputStatus field with the matched response
                            };
                        });
                        setToolboxTalkDetailsData(UsersListData);
                        setIsLoading(false);
                    }
                } else {
                    if (!!results) {
                        const UsersListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    Response: !!data.Response ? data.Response : '',
                                    ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : '',
                                    ToolboxTalkMaster: !!data.ToolboxTalkMaster ? data.ToolboxTalkMaster.Title : '',
                                    outputStatus: "",
                                    UpdateID: 0,
                                }
                            );
                        });
                        setToolboxTalkDetailsData(UsersListData);
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

    const onChangeMeetingLocation = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMeetingLocation(newValue || "");
    };

    const onChangeSubject = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSubject(newValue || "");
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
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        let isValidForm = true;
        const IsCreateNewRecord = (type == "create") ? true : false;
        type = (type == "create") ? "submit" : type;
        try {
            const MeetingDate = moment(Today, DateFormat).toDate();
            if (IsUpdate && !IsCreateNewRecord) {
                if (
                    isValidForm &&
                    selectedSite !== "" &&
                    selectedSite !== null &&
                    defaultManager !== null &&
                    Minutestakenandrecordedby !== "" &&
                    MeetingLocation !== "" &&
                    MeetingLocation !== "N/A" &&
                    selectedEmployee !== null &&
                    selectedEmployee !== "" &&
                    NMFD !== "" &&
                    DiscussionPoints !== ""
                ) {
                    const toastMessage = 'Toolbox Talk has been updated successfully!';
                    await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxTalkDetailsData, UpdateDetailsData);
                    await props.provider.updateListItemsInBatchPnP(ListNames.ToolboxTalkMasterData, UpdateData);
                    const ToolBoxTalkData = {
                        MeetingDate: MeetingDate,
                        Location: !!MeetingLocation ? MeetingLocation : "N/A",
                        Subject: !!Subject ? Subject : "",
                        MinutesTakenAndRecordedBy: !!Minutestakenandrecordedby ? Minutestakenandrecordedby : "",
                        DiscussionPoints: !!DiscussionPoints ? DiscussionPoints : "",
                        Comments: !!MainComments ? MainComments : "N/A",
                        MattersfromPreviousMeetings: !!MFPM ? MFPM : "N/A",
                        NewMattersforDiscussion: !!NMFD ? NMFD : "",
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ShiftType: selectedShiftType || defaultShiftType,
                        Attendees: !!selectedEmployee ? selectedEmployee : "",
                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                        FormStatus: type,
                        IsSendEmail: (type == "submit" && ToolboxTalk?.FormStatus == "draft") ? true : false
                    };
                    await props.provider.updateItemWithPnP(ToolBoxTalkData, ListNames.ToolboxTalk, UpdateItemId);
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.ToolboxTalk,
                        EntityId: UpdateItemId,
                        EntityName: GeneratedID,
                        Details: `Update Toolbox Talk`,
                        LogFor: UserActionLogFor.Both,
                        StateId: props?.componentProps?.qCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    if (selectedFiles.length > 0) {
                        setIsLoading(true);
                        await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxTalk, selectedFiles, UpdateItemId)
                            .then((results: any[]) => {
                                console.log("All files uploaded successfully");

                            })
                            .catch((error: any) => {
                                console.error("Failed to upload files", error);
                                setIsLoading(false);
                            });
                    }

                    setTimeout(() => {
                        onClickCancel();
                        //setIsLoading(false);
                    }, 1000);

                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {
                    const errormsg: any[] = [];
                    if (masterStateId === undefined) {
                        errormsg.push(<div>Job site is required</div>);
                    }
                    if (defaultManager == null) {
                        errormsg.push(<div>Manager is required</div>);
                    }
                    if (Minutestakenandrecordedby == "") {
                        errormsg.push(<div>Minutes taken and recorded by is required</div>);
                    }
                    if (MeetingLocation == "" || MeetingLocation == "N/A") {
                        errormsg.push(<div>Meeting location is required</div>);
                    }
                    if (selectedEmployee == null || selectedEmployee == "") {
                        errormsg.push(<div>Atlease one Attendees is required</div>);
                    }
                    if (IsLimit) {
                        errormsg.push(<div>You can select a maximum 50 attendees.</div>);
                    }
                    if (NMFD == "") {
                        errormsg.push(<div>New Matters for Discussion is required</div>);
                    }
                    if (DiscussionPoints == "") {
                        errormsg.push(<div>Discussion Points is required</div>);
                    }

                    // console.log("errormsg", errormsg);
                    setErrorData(errormsg);
                    showPopup2();
                    toastService.dismiss(toastId);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(true);
                let isValid = true;
                let createdId: number = 0;
                if (type === "draft" || (isValid && defaultManager !== null && Minutestakenandrecordedby !== "" && MeetingLocation !== "" && Minutestakenandrecordedby !== "" && selectedEmployee !== null && NMFD !== "" && DiscussionPoints !== "")) {
                    const toastMessage = 'Toolbox Talk has been added successfully!';
                    const ToolBoxTalkData = {
                        Title: !!GeneratedID ? GeneratedID : "",
                        MeetingDate: MeetingDate,
                        MeetingID: !!GeneratedID ? GeneratedID : "",
                        Location: !!MeetingLocation ? MeetingLocation : "N/A",
                        Subject: !!Subject ? Subject : "",
                        ChairpersonId: [defaultManager],
                        MinutesTakenAndRecordedBy: !!Minutestakenandrecordedby ? Minutestakenandrecordedby : "",
                        DiscussionPoints: !!DiscussionPoints ? DiscussionPoints : "",
                        Comments: !!MainComments ? MainComments : "N/A",
                        MattersfromPreviousMeetings: !!MFPM ? MFPM : "N/A",
                        NewMattersforDiscussion: !!NMFD ? NMFD : "",
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ShiftType: selectedShiftType || defaultShiftType,
                        Attendees: !!selectedEmployee ? selectedEmployee : "",
                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                        FormStatus: type,
                        CreatedDate: (IsUpdate) ? ToolboxTalk?.CreatedDate ?? new Date() : new Date(),
                        HistoryId: (IsUpdate) ? UpdateItemId : null,
                        IsSendEmail: (type == "submit") ? true : false

                    };
                    await props.provider.createItem(ToolBoxTalkData, ListNames.ToolboxTalk).then(async (item: any) => {
                        createdId = item.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.ToolboxTalk,
                            EntityId: Number(createdId),
                            EntityName: GeneratedID,
                            Details: `Add Toolbox Talk`,
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
                                    MasterId: createdId
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
                                    //ToolboxTalkId: createdId
                                }));

                                updatedCreateDetailsData = CreateDetailsData.map(({ UpdateID, ID, ...rest }: any) => ({
                                    ...rest,
                                    MasterId: createdId
                                }));


                                //Inactive previous record
                                const toolBoxInactive = {
                                    IsActive: false
                                };
                                await props.provider.updateItemWithPnP(toolBoxInactive, ListNames.ToolboxTalk, UpdateItemId);
                            }

                            await props.provider.createItemInBatch(updatedCreateData, ListNames.ToolboxTalkMasterData);
                            await props.provider.createItemInBatch(updatedCreateDetailsData, ListNames.ToolboxTalkDetailsData);

                            if (ListAttachmentsFiles && ListAttachmentsFiles.length > 0) {
                                for (const attachment of ListAttachmentsFiles) {
                                    await uploadAttachment(attachment, createdId);
                                }
                            }

                            if (selectedFiles.length > 0) {
                                setIsLoading(true);
                                await props.provider.uploadAttachmentsToListSequential(ListNames.ToolboxTalk, selectedFiles, createdId)
                                    .then((results: any[]) => {
                                        console.log("All files uploaded successfully");
                                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                        setIsLoading(false);
                                        onClickCancel();
                                    })
                                    .catch((error: any) => {
                                        console.error("Failed to upload files", error);
                                        setIsLoading(false);
                                    });
                            } else {

                                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                setIsLoading(false);
                                onClickCancel();
                            }
                        }

                    }).catch(err => console.log(err));
                    setIsLoading(false);
                } else {
                    const errormsg: any[] = [];
                    if (selectedSite == "" || selectedSite == null) {
                        errormsg.push(<div>Site is required</div>);
                    }
                    if (masterStateId === undefined) {
                        errormsg.push(<div>Job site is required</div>);
                    }
                    if (defaultManager == null) {
                        errormsg.push(<div>Manager is required</div>);
                    }
                    if (Minutestakenandrecordedby == "") {
                        errormsg.push(<div>Minutes taken and recorded by is required</div>);
                    }
                    if (MeetingLocation == "") {
                        errormsg.push(<div>Meeting location is required</div>);
                    }
                    if (selectedEmployee == null) {
                        errormsg.push(<div>Atlease one Attendees is required</div>);
                    }
                    if (IsLimit) {
                        errormsg.push(<div>You can select a maximum 50 attendees.</div>);
                    }
                    if (NMFD == "") {
                        errormsg.push(<div>New Matters for Discussion is required</div>);
                    }
                    if (DiscussionPoints == "") {
                        errormsg.push(<div>Discussion Points is required</div>);
                    }

                    // console.log("errormsg", errormsg);
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
    };

    //Details Data
    const MasterData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ToolboxTalkMasterId,ToolboxTalkMaster/Title,IsShow,Comment,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxTalkMaster", "SiteName"],
                // filter: `IsShow eq 1 and MasterId eq '${props?.siteMasterId}'`,
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxTalkMasterData,
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
                                ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : '',
                                ToolboxTalkMaster: !!data.ToolboxTalkMaster ? data.ToolboxTalkMaster.Title : ''
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
            const select = ["ID,ToolboxTalkDetailsId,ToolboxTalkDetails/Title,Response,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxTalkDetails", "SiteName"],
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxTalkDetailsData,
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
                                ToolboxTalkDetailsId: !!data.ToolboxTalkDetailsId ? data.ToolboxTalkDetailsId : '',
                                ToolboxTalkDetails: !!data.ToolboxTalkDetails ? data.ToolboxTalkDetails.Title : ''
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


    const _ToolboxTalk = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Subject,MeetingDate,FormStatus,CreatedDate,IsActive,Location,ShiftType,ChairpersonId,Chairperson/Title,Chairperson/Name,SiteNameId,SiteName/Title,MeetingID,Attendees,MinutesTakenAndRecordedBy,DiscussionPoints,MattersfromPreviousMeetings,NewMattersforDiscussion,Comments,AttendeesEmailId,AttendeesEmail/Email,Attachments,AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName", "Chairperson", "AttachmentFiles", "AttendeesEmail"],
                filter: `Id eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxTalk,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
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
                                Title: data.Title,
                                MeetingDate: !!data.MeetingDate ? moment(data.MeetingDate).format(DateFormat) : '',
                                CreatedDate: !!data.CreatedDate ? data.CreatedDate : new Date(),
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                MeetingID: !!data.MeetingID ? data.MeetingID : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                ShiftType: !!data.ShiftType ? data.ShiftType : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                MinutesTakenAndRecordedBy: !!data.MinutesTakenAndRecordedBy ? data.MinutesTakenAndRecordedBy : '',
                                DiscussionPoints: !!data.DiscussionPoints ? data.DiscussionPoints : '',
                                MattersfromPreviousMeetings: !!data.MattersfromPreviousMeetings ? data.MattersfromPreviousMeetings : '',
                                NewMattersforDiscussion: !!data.NewMattersforDiscussion ? data.NewMattersforDiscussion : '',
                                Comments: !!data.Comments ? data.Comments : '',
                                Chairperson: !!data.ChairpersonId ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
                                AttendeesEmail: !!data.AttendeesEmailId ? data.AttendeesEmail.map((i: { ID: any; }) => i.ID) : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                Attachment: attachmentFiledata,
                                AttachmentFiles: data.AttachmentFiles

                            }
                        );
                    });
                    setGeneratedID(UsersListData[0]?.MeetingID);
                    setToday(UsersListData[0]?.MeetingDate);
                    setMinutestakenandrecordedby(UsersListData[0].MinutesTakenAndRecordedBy);
                    setMeetingLocation(UsersListData[0].Location);
                    setSubject(UsersListData[0].Subject);
                    setToolboxTalk(UsersListData[0]);
                    setMFPM(UsersListData[0].MattersfromPreviousMeetings);
                    setNMFD(UsersListData[0].NewMattersforDiscussion);
                    setMainComments(UsersListData[0].Comments);
                    setDiscussionPoints(UsersListData[0].DiscussionPoints);
                    setSelectedEmployee(UsersListData[0].Attendees);
                    setClientLookUp(UsersListData[0].AttendeesEmailId);
                    setAttachments(UsersListData[0].Attachment);
                    setSelectedSite(UsersListData[0].SiteNameId);
                    setDefaultShiftType(UsersListData[0].ShiftType);

                    setListAttachmentsFiles(UsersListData[0].AttachmentFiles);

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
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            MasterData();
            DetailsData();
        } else {
            _ToolboxTalkData();
            _ToolboxTalkDetailsData();
        }
    }, [selectedSite]);

    React.useEffect(() => {
        if (AllMasterData.length > 0)
            _ToolboxTalkData();
    }, [AllMasterData]);

    React.useEffect(() => {
        if (AllDetailData.length > 0)
            _ToolboxTalkDetailsData();
    }, [AllDetailData]);



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
                _ToolboxTalk();
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
                selectedStatus[item.ToolboxTalkDetailsId] = item.Response
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
        setMeetingLocation("");
    };

    const onIMSLocationChange = (loc: any): void => {
        setMeetingLocation(loc);
    };

    if (isComponentClosed) {
        // Render the success component only when the current one is closed
        return <SuccessComponent />;
    }


    const _getShiftTypeChoices = async () => {
        setIsLoading(true);
        try {
            // Fetch choices from your existing service function
            const roleChoices = await props.provider.choiceOption(ListNames.ToolboxTalk, "ShiftType");

            if (Array.isArray(roleChoices) && roleChoices.length > 0) {

                // Map each choice into a standardized option format
                const optionRoles = roleChoices.map((choice, index) => ({
                    key: index,            // unique key for UI components
                    value: choice,         // actual value
                    text: choice,          // display text
                    label: choice          // optional label (useful for UI libraries)
                }));

                // Save to state
                setShiftTypeOptions(optionRoles);
            } else {
                setShiftTypeOptions([]);
            }
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMethodName: "_getShiftTypeChoices",
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
                                    onClick={onClickCancel}
                                />
                            </div>
                        </div>
                        <div className="">
                            <div className="boxCard">
                                <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                    <tr>
                                        <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                        <td className="td-toolbox-talk middle-box"><div>Toolbox Meeting Agenda & Minutes</div></td>
                                        <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-CP-13-F1</div></td>
                                    </tr>
                                </table>
                                <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">Meeting ID: {GeneratedID}</div></div></div>
                                <table className="table-toolbox-talk">
                                    <tr>
                                        <td className="td-toolbox-talk"><b>Meeting Date:</b></td>
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
                                            <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}</td>
                                        }
                                    </tr>
                                    {/* {props.isForm === true && selectedSite === "" ? */}
                                    {props.isForm === true ?
                                        <tr></tr> :
                                        <tr>
                                            <td className="td-toolbox-talk"><b>Meeting Chairperson: <span className="required"> *</span></b> </td>
                                            {ManagerOptions && IsUpdate === false ?
                                                <td className="td-toolbox-talk">
                                                    <ReactDropdown
                                                        isDisabled={selectedSite == "" || selectedSite == null}
                                                        options={ManagerOptions}
                                                        isMultiSelect={false}
                                                        defaultOption={defaultManager || selectedManager}
                                                        onChange={_onManagerChange}
                                                        placeholder={"Select Chairperson"} />
                                                </td> : <td className="td-toolbox-talk"> {ToolboxTalk?.Chairperson}</td>
                                                // </td> : <td className="td-toolbox-talk"> {SiteData[0]?.SiteManagerName?.join(', ')}</td>
                                            }
                                        </tr>

                                    }

                                    <tr>

                                        <td className="td-toolbox-talk"><b>Meeting Location:<span className="required"> *</span></b></td>

                                        <td className="td-toolbox-talk">
                                            {/* <TextField className="formControl"
                                                name='MeetingLocation'
                                                placeholder="Enter Meeting Location"
                                                value={MeetingLocation}
                                                onChange={onChangeMeetingLocation} /> */}

                                            <IMSLocationCommonFilter
                                                onIMSLocationChange={onIMSLocationChange}
                                                provider={props.provider}
                                                selectedIMSLocation={MeetingLocation}
                                                defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                siteNameId={selectedSite}
                                                Title="Toolbox Talk"
                                                Label="Meeting Location"
                                                placeHolder="Select Location"
                                                IsUpdate={IsUpdate}
                                            />
                                        </td>

                                    </tr>
                                    <tr>
                                        <td className="td-toolbox-talk"><b>Shift Type:</b></td>
                                        {shiftTypeOptions ?
                                            <td className="td-toolbox-talk">
                                                <ReactDropdown
                                                    options={shiftTypeOptions}
                                                    isMultiSelect={false}
                                                    defaultOption={defaultShiftType || selectedShiftType}
                                                    onChange={_onShiftTypeChange}
                                                    isSorted={false}
                                                    isClearable={true}
                                                    placeholder={"Select Shift Type"}
                                                    isDisabled={!selectedSite} />
                                            </td> : <td className="td-toolbox-talk"> {defaultShiftType}</td>}
                                    </tr>
                                    <tr>

                                        <td className="td-toolbox-talk"><b>Minutes taken and recorded by: <span className="required"> *</span></b></td>
                                        <td className="td-toolbox-talk"><TextField className="formControl" name='Minutestakenandrecordedby' placeholder="Enter Minutes taken and recorded by" value={Minutestakenandrecordedby} onChange={onChangeMinutestakenandrecordedby} /></td>
                                    </tr>
                                    <tr>
                                        <td className="td-toolbox-talk"><b>Attendee Type: <span className="required"> *</span></b></td>
                                        <td className="td-toolbox-talk">
                                            <div className="divAttendeeType">
                                                <ChoiceGroup selectedKey={selectedAttendeeType} options={attendeeOptions} onChange={onChange} />
                                            </div>
                                        </td>
                                    </tr>
                                    {(masterStateId !== undefined) && (
                                        <tr>
                                            <td className="td-toolbox-talk"><b>Attendees: <span className="required"> *</span></b></td>
                                            <td className="td-toolbox-talk add-max-width">
                                                <AddOtherEmployee
                                                    onEmployeeChange={onEmployeeChange}
                                                    provider={props.provider}
                                                    // StateId={SiteData[0]?.StateId}
                                                    StateId={StateId}
                                                    isDisabled={!selectedSite}
                                                    isCloseMenuOnSelect={false}
                                                    defaultOption={ClientLookUp}
                                                    selectedAttendeeType={selectedAttendeeType}
                                                    selectedAttendeeOptions={selectedAttendeeOptions}
                                                />
                                                {IsLimit && <div className="requiredlink">You can select a maximum 50 attendees.</div>}
                                            </td>
                                        </tr>
                                    )}
                                </table>
                                <div className="main-header-text mt-3">Meeting Agenda</div>
                                <div className="sub-main-header-text mt-2">Acknowledgement of Country</div>
                                <div className="">
                                    In the spirit of reconciliation Quayclean acknowledges the Traditional Custodians of country
                                    throughout Australia and their connections to land, sea and community. We pay our respect
                                    to their Elders past, present and future and extend that respect to all Aboriginal and Torres
                                    Strait Islander peoples here today.
                                </div>

                                <div className="sub-main-header-text mt-2">Matters from Previous Meetings</div>
                                <div className="mt-1">
                                    <RichText value={MFPM}
                                        onChange={(text) => onMFPMChange(text)}
                                        isEditMode={true}
                                    />
                                </div>
                                <div className="sub-main-header-text mt-2">New Matters for Discussion<span className="required"> *</span></div>
                                <div className="mt-1">
                                    <RichText value={NMFD}
                                        onChange={(text) => onNMFDChange(text)}
                                        isEditMode={true}
                                    />
                                </div>
                                <div className="sub-main-header-text mt-2">Discussion Points<span className="required"> *</span></div>
                                <div className="mt-1">
                                    <RichText value={DiscussionPoints}
                                        onChange={(text) => onDiscussionPointsChange(text)}
                                        isEditMode={true}
                                    />
                                </div>
                                <div className="sub-main-header-text mt-2">Associated Documents</div>
                                <div className="mt-1">
                                    {/* {IsUpdate ? */}
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
                                        {/* {!!ToolboxTalk && ToolboxTalk?.Attachment?.length === 0 &&
                                                <span>Image Not Found</span>} */}
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
                                    {/* : */}
                                    <TextField type="file"
                                        multiple={fileattachment.isMultipleFiles}
                                        onChange={fileSelectionChange}
                                        name="Files"
                                        className='FileUpload mt-1' />
                                    {/* } */}
                                </div>
                                <div className="pdf-lbl-talk mt-1">Comments</div>
                                <div className="mt-1">
                                    <RichText value={MainComments}
                                        onChange={(text) => onMainCommentsChange(text)}
                                        isEditMode={true}
                                    />
                                </div>
                                <div>
                                    {ToolboxTalkData.length > 0 && ToolboxTalkDetailsData.length > 0 &&
                                        <div>

                                            {ToolboxTalkData.map((item) => {
                                                const details = ToolboxTalkDetailsData.filter(
                                                    (detail) => detail.ToolboxTalkMasterId === item.ID
                                                );

                                                return (
                                                    <div key={item.ID}>
                                                        <div className="sub-main-header-text mt-3 dflex">
                                                            {item.Title}
                                                            <div className="toggle-class">
                                                                {IsUpdate && (ToolboxTalk && ToolboxTalk?.FormStatus !== "draft") ?
                                                                    <Toggle
                                                                        //checked={item.IsShow}
                                                                        checked={showToggles[item.ID] ?? false}
                                                                        onChange={(e, checked) => handleToggleChange(item.ID, checked)}
                                                                        onText="Yes"
                                                                        offText="No"
                                                                        className="mt-2"
                                                                    /> :
                                                                    <Toggle
                                                                        checked={showToggles[item.ID] ?? false}
                                                                        onChange={(e, checked) => handleToggleChange(item.ID, checked)}
                                                                        onText="Yes"
                                                                        offText="No"
                                                                        className="mt-2"
                                                                    />}

                                                            </div>
                                                        </div>
                                                        {/* {(IsUpdate && item.IsShow === false) ? <> */}
                                                        {(IsUpdate && showToggles[item.ID] === false) ? <>
                                                        </>
                                                            :
                                                            <>
                                                                {(showToggles[item.ID] && details.length > 0) ?
                                                                    <div>

                                                                        <table className="sub-toolbox-table mt-2">
                                                                            <thead>
                                                                                <tr className="sub-toolbox-tr">
                                                                                    <th className="sub-toolbox-th">Item</th>
                                                                                    <th className="sub-toolbox-th">Response</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {details.map((detail) => (
                                                                                    <tr className="sub-toolbox-tr" key={detail.ID}>
                                                                                        <td className="sub-toolbox-td-item">{detail.Title}</td>
                                                                                        <td className="sub-toolbox-td-response">
                                                                                            {IsUpdate ?
                                                                                                <Dropdown
                                                                                                    selectedKey={selectedToolBoxTalkStatus[detail.ID] || detail.outputStatus}
                                                                                                    options={dropdownOptions}
                                                                                                    placeholder="Select Status"
                                                                                                    onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detail.ID, option.key)}
                                                                                                />
                                                                                                :
                                                                                                <Dropdown
                                                                                                    selectedKey={selectedToolBoxTalkStatus[detail.ID]}
                                                                                                    options={dropdownOptions}
                                                                                                    placeholder="Select Status"
                                                                                                    onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detail.ID, option.key)}
                                                                                                />
                                                                                            }


                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                        {(item.IsComment || details.length == 0) && (
                                                                            <>
                                                                                <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
                                                                                <div className="mt-1">
                                                                                    <RichText
                                                                                        value={comments[item.ID] || item.Comment}
                                                                                        onChange={(text: any) => handleRichTextChange(item.ID, text)}
                                                                                        isEditMode={true}
                                                                                    />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div> : <div className="">
                                                                        {(showToggles[item.ID] && details.length === 0) && (
                                                                            <>
                                                                                <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
                                                                                <div className="mt-1">
                                                                                    <RichText
                                                                                        value={comments[item.ID] || item.Comment}
                                                                                        onChange={(text: any) => handleRichTextChange(item.ID, text)}
                                                                                        isEditMode={true}
                                                                                    />
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                }</>
                                                        }
                                                    </div>
                                                );
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
                                            onClick={onClickCancel}
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
                                <h2 className="mt-10">Missing Data</h2>
                                <div className="mt-3">
                                    <ul>
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