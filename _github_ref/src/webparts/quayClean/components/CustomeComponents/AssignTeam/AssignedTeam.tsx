/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../../QuayClean";
import { ListNames, pageLength, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { Checkbox, DefaultButton, IContextualMenuProps, ISearchBoxStyles, Label, Link, Panel, PanelType, PrimaryButton, SearchBox, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "@fluentui/react-hooks";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { AddNewMember } from "./AddNewMember";
import { Loader } from "../../CommonComponents/Loader";
import { IAssociatedTeam } from "../../../../../Interfaces/IAssociatedTeam";
import { toastService } from "../../../../../Common/ToastService";
import { AddTeamPhoto } from "./AddTeamPhoto";
import { generateAndSaveKendoPDF, generateExcelTable, getCAMLQueryFilterExpression, getConvertedDate, logGenerator, onSearch, parseIndianFormattedNumber, UserActivityLog } from "../../../../../Common/Util";
import CustomModal from "../../CommonComponents/CustomModal";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import DraggableList from "../../CommonComponents/DragDrop/DraggableList";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { AssignedTeamPDF } from "../../CommonComponents/AssignedTeam/AssignedTeamPDF";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";

import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import moment from "moment";
import { DateFormat } from "../../../../../Common/Constants/CommonConstants";
import { FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";
import { IExportColumns } from "../UserActivityLog";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
const blankProfile = require('../../../assets/images/UserBlank.svg');
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');

export interface IAssignedTeamProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    context: WebPartContext;
    qCState?: any;
    siteMasterId: any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    qCStateId?: any;
    siteName?: string
    selectedZoneDetails?: ISelectedZoneDetails
}

export interface IAssignedTeamState {
    column: any[];
    searchText: string;
    isAddNewMemberModelOpen: boolean;
    associatedTeamItems: IAssociatedTeam[];
    filterAssociatedTeamItems: IAssociatedTeam[];
    isNewUserAdd: boolean;
    isReload: boolean;
    isAddTeamPhotoModelOpen: boolean;
    isDeleteModelOpen: boolean;
    teamPhoto: any;
    isUpdateTeamPhoto: boolean;
    teamPhotoId: number;
    isSendEmailModelShow: boolean;
    isShowErrorTitle: boolean;
    isShowErrorEmail: boolean;
    isShowError: boolean;
    sendEmailTitle: string;
    sendEmailTo: string;
    keyUpdate: number;
    selectedItem: any[];

}

const searchBoxStyles: Partial<ISearchBoxStyles> = {
    root: {
        border: '1px solid #e9ecef',
        borderbottom: '2px solid #acd0ec',
    }
};


export interface ITeamPhoto {
    Id: number;
    siteNameId: number;
    teamPhotoSrc: string;
}

export const AssignedTeam = (props: IAssignedTeamProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { PermissionArray } = appSiteState;
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Drag, setDrag] = React.useState<boolean>(false);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [DeleteId, setDeleteId] = React.useState<any>();
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
    const [allFileData, setallFileData] = React.useState<any[]>([]);
    const [allSkillSetData, setallSkillSetData] = React.useState<any[]>([]);
    const [fileURL, setFileURL] = React.useState<string>('');
    const [Notes, setNotes] = React.useState<string>('');
    const [showModal, setShowModal] = React.useState(false);
    const openModal = () => { setShowModal(true); };
    const closeModal = () => { setShowModal(false); };
    const [EmailArray, setEmailArray] = React.useState<any[]>([]);
    const [IsSubLocation, setIsSubLocation] = React.useState<boolean>(false);
    const [isNotesPanelOpen, setIsNotesPanelOpen] = React.useState(false);
    const [viewType, setViewType] = React.useState<"grid" | "card">("grid");
    const draggableListRef = React.useRef<any>(null);
    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);
    const [state, setState] = React.useState<IAssignedTeamState>({
        column: [],
        isAddNewMemberModelOpen: false,
        associatedTeamItems: [],
        filterAssociatedTeamItems: [],
        isNewUserAdd: true,
        sendEmailTo: "",
        searchText: "",
        isReload: false,
        isAddTeamPhotoModelOpen: false,
        isDeleteModelOpen: false,
        teamPhoto: "",
        isUpdateTeamPhoto: false,
        teamPhotoId: 0,
        isSendEmailModelShow: false,
        isShowErrorTitle: false,
        isShowErrorEmail: false,
        isShowError: false,
        sendEmailTitle: "",
        keyUpdate: Math.random(),
        selectedItem: []
    });

    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const isVisibleCrud = React.useRef<boolean>(false);
    const [flag, setFlag] = React.useState(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);

    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [selectedSite, setSelectedSite] = React.useState<any>(null);
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };
    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
    };

    const handleFlagUpdate = () => {
        setFlag(!flag); // Toggle flag value
    };

    const handleSelectedRecordsChange = (records: any[]) => {
        if (records.length > 0) {
            if (records.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(records[0]);
                setNotes(records[0].Notes);
                setState((prevState: any) => ({ ...prevState, teamPhoto: records[0].attachmentURl, selectedItem: records }));
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(records);
                setNotes("");
                setState((prevState: any) => ({ ...prevState, teamPhoto: "", selectedItem: records }));
            }
            setisDisplayEDbtn(true);
        } else {
            setState((prevState: any) => ({ ...prevState, teamPhoto: "", selectedItem: [] }));
            setNotes("");
            setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };
    const openEmployeePanel = () => {
        setIsNotesPanelOpen(true);
    }


    const _getSkillSetData = () => {
        try {
            let filter = "";
            if (!!props.siteMasterId) {
                filter = `SiteNameId eq ${props.siteMasterId}`;
            }
            const select = ["ID,Title,SiteNameId,ExpiryDate,AssociatedTeamId,CardNumber"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: filter,
                top: 5000,
                listName: ListNames.SkillSet,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any) => {
                if (!!results) {
                    let SkillSetData: any = results.map((data: any) => {
                        let skillsetItem: any = {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                            AssociatedTeamId: !!data.AssociatedTeamId ? data.AssociatedTeamId : "",
                            ExpiryDate: !!data.ExpiryDate ? getConvertedDate(data.ExpiryDate) : "",
                            CardNumber: !!data.CardNumber ? data.CardNumber : "",
                        };
                        return skillsetItem;
                    });
                    setallSkillSetData(SkillSetData);
                    // setDrag(true);
                }

            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        }
        catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const onClickDeleteIcon = async () => {
        setIsLoading(true);
        const toastMessage = 'Deleted item  successfully!';
        const toastId = toastService.loading('Loading...');

        const processUpdateItem = (input: any) => {
            if (Array.isArray(input)) {
                return input.map(item => ({
                    Id: item.id,
                    IsDeleted: true
                }));
            } else if (typeof input === 'object' && input !== null) {
                return [{ Id: input.id, IsDeleted: true }];
            } else {
                return [];
            }
        };
        if (UpdateItem.length > 0) {
            UpdateItem.forEach((res: any, index: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: UpdateItem[index]?.siteNameId, // Match index dynamically
                    ActionType: UserActivityActionTypeEnum.Delete,
                    EntityType: UserActionEntityTypeEnum.AssignedTeam,
                    EntityId: UpdateItem[index]?.id, // Use res dynamically
                    EntityName: UpdateItem[index]?.title, // Match index dynamically
                    Details: `Delete Assigned Team Member`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
            });
        } else {
            const logObj = {
                UserName: props?.loginUserRoleDetails?.title,
                SiteNameId: UpdateItem?.siteNameId, // Match index dynamically
                ActionType: UserActivityActionTypeEnum.Delete,
                EntityType: UserActionEntityTypeEnum.AssignedTeam,
                EntityId: UpdateItem?.id, // Use res dynamically
                EntityName: UpdateItem?.title, // Match index dynamically
                Details: `Delete Assigned Team Member`,
                StateId: props?.qCStateId
            };
            void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);

        }

        const newObjects = processUpdateItem(UpdateItem);

        if (newObjects.length > 0) {
            await provider.updateListItemsInBatchPnP(ListNames.SitesAssociatedTeam, newObjects);
        }

        handleFlagUpdate();
        setState((prevState: any) => ({ ...prevState, isDeleteModelOpen: false, isReload: !state.isReload, }));
        setIsLoading(false);
        setisDisplayEDbtn(false);

        toastService.updateLoadingWithSuccess(toastId, toastMessage);
    };

    const genrateColumn = () => {
        const column: any[] = [
            {
                key: "key2", name: 'Profile Picture', fieldName: 'Profile Picture', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true,
                onRender: (item: any) => {
                    // <img src={!!item.attachmentURl ? item.attachmentURl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "72px", width: '72px', borderRadius: "50%", objectFit: "cover" }} />
                    const imgURL = item.attachmentURl || blankProfile;
                    return (
                        <LazyLoadImage
                            src={imgURL}
                            width={72}
                            height={72}
                            alt="Photo"
                            className="course-img-first"
                            placeholderSrc={blankProfile} // Fallback while loading
                            effect="blur" // Optional loading effect
                        />
                    )
                },
            },
            {
                key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.SiteName != "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.SiteName} id={tooltipId}>
                                        {item.SiteName}
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            {
                key: "key1",
                name: 'Employee Name',
                fieldName: 'aTUserName',
                isResizable: true,
                minWidth: 100,
                maxWidth: 200,
                isSortingRequired: true,
            },
            { key: "key2", name: 'Role', fieldName: 'aTRole', isResizable: true, minWidth: 100, maxWidth: 200, isSortingRequired: true },
            {
                key: "key3", name: 'Skill Set', fieldName: 'Id', isResizable: true, minWidth: 180, maxWidth: 300, isSortingRequired: true,
                onRender: ((item: any) => {
                    // let adata: any[] = [];
                    // if (allSkillSetData.length > 0) {
                    //     adata = allSkillSetData.filter(r => r.AssociatedTeamId == itemID.id);
                    // }

                    return (
                        <div>
                            <ul>
                                {item.Skills?.map((item: any) => (
                                    // Create a list item for each name in data array
                                    <li className="ss-mb5 skillsetBadge">
                                        {item.Title}<br></br>
                                        <span className="EDLBL">Card Number: {item.CardNumber}</span><br></br>
                                        <span className="EDLBL">Expiry Date: {item.ExpiryDate}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })
            },
            {
                key: "key4", name: 'Certificates', fieldName: 'Id', isResizable: true, minWidth: 220, maxWidth: 300, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    let adata: any[] = [];
                    if (allFileData.length > 0) {
                        adata = allFileData.filter(r => r.ATUser[0]?.lookupId == itemID.id);
                    }

                    return (
                        <div>
                            <ul>

                                {adata.map((item: any) => (
                                    // Create a list item for each name in data array
                                    <li>
                                        <Link className="" onClick={() => {
                                            setFileURL(item.EncodedAbsUrl); openModal();
                                        }}>
                                            <TooltipHost content={"View Certificate"} id={tooltipId}>
                                                <li key={item.id} className="ulli">
                                                    <FontAwesomeIcon icon={"arrow-right"} style={{ marginRight: '5px', width: '14px' }} />     {item.Certificates}
                                                </li>
                                            </TooltipHost>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })
            },
            { key: "key6", name: 'Operator Type', fieldName: 'OperatorType', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
        ];
        return column;
    };

    const getStateAssociatedTeam = () => {
        try {
            let filterFields: any[] = [];
            if (selectedSiteIds.length > 0) {
                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: selectedSiteIds,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                },
                    {
                        fieldName: "IsDeleted",
                        fieldValue: true,
                        fieldType: FieldType.Boolean,
                        LogicalType: LogicalType.NotEqualTo
                    });
            } else {
                if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length > 0) {
                    filterFields.push({
                        fieldName: "SiteName",
                        fieldValue: selectedZoneDetails?.defaultSelectedSitesId,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    },
                        {
                            fieldName: "IsDeleted",
                            fieldValue: true,
                            fieldType: FieldType.Boolean,
                            LogicalType: LogicalType.NotEqualTo
                        });
                } else {
                    if (selectedZoneDetails && selectedZoneDetails?.selectedSitesId?.length > 0) {
                        filterFields.push({
                            fieldName: "SiteName",
                            fieldValue: selectedZoneDetails?.selectedSitesId,
                            fieldType: FieldType.LookupById,
                            LogicalType: LogicalType.In
                        },
                            {
                                fieldName: "IsDeleted",
                                fieldValue: true,
                                fieldType: FieldType.Boolean,
                                LogicalType: LogicalType.NotEqualTo
                            });
                    } else {
                        filterFields.push(
                            {
                                fieldName: "IsDeleted",
                                fieldValue: true,
                                fieldType: FieldType.Boolean,
                                LogicalType: LogicalType.NotEqualTo
                            });
                    }
                }
            }

            let camlQuery = new CamlBuilder()
                .View(["Id", 'Email', "Location", 'UserId', 'Index', 'Title', 'SkillSet', 'ATRole', "ATUserName", "Attachments", "AttachmentFiles", "Notes", "OperatorType", "SiteName", "StateName"])
                .LeftJoin("SiteName", "SiteName").
                Select('StateNameValue', "StateName").
                Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();

            if (filterFields.length > 0) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }

            return provider.getItemsByCAMLQuery(ListNames.SitesAssociatedTeam, camlQuery.ToString());
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setIsErrorModelOpen(true);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  getStateAssociatedTeam",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect View Site"
            };
            void logGenerator(provider, errorObj);
        }

        return [];
    };

    const closeModel = () => {
        setState(prevState => ({ ...prevState, isAddNewMemberModelOpen: false, isReload: !state.isReload, isAddTeamPhotoModelOpen: false, isDeleteModelOpen: false }));
    };
    const CloseModelNewMember = () => {
        setState(prevState => ({ ...prevState, isAddNewMemberModelOpen: false, isAddTeamPhotoModelOpen: false, isDeleteModelOpen: false }));
    }

    const onclickconfirmdelete = () => {
        setState(prevState => ({ ...prevState, isDeleteModelOpen: true, deleteItemId: DeleteId }));
    };

    const onclickEdit = () => {
        setisDisplayEDbtn(false);
        handleFlagUpdate();
        setState(prevState => ({ ...prevState, selectedAssociatedTeamItem: UpdateItem, isAddNewMemberModelOpen: true, isNewUserAdd: false }));
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    React.useEffect(() => {
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray?.includes('Assigned Team') || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;

        try {
            const select = ["ID,Title,SubLocation"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: !props.siteMasterId ? '' : `ID eq ${props.siteMasterId}`,
                listName: ListNames.SitesMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SiteData: any = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                SubLocation: !!data.SubLocation ? data.SubLocation : false
                            }
                        );
                    });
                    setIsSubLocation(SiteData[0]?.SubLocation);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }

    }, []);

    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);

        const isTitleEmpty = !state.sendEmailTitle;
        const isEmailEmpty = !state.sendEmailTo;
        const isEmailInvalid = !isEmailEmpty && !state.sendEmailTo?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
        setState((prevState: any) => ({ ...prevState, isShowError: isEmailInvalid, isShowErrorEmail: isEmailEmpty, isShowErrorTitle: isTitleEmpty }))

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {

            const fileName = `${props?.siteName} AssignedTeam`;
            let fileblob: any = await generateAndSaveKendoPDF("AssignedTeamPDF", fileName);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}.pdf`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: state.sendEmailTitle,
                SendToEmail: state.sendEmailTo,
                StateName: props?.qCState,
                SiteName: props?.siteName,
                EmailType: "AssignedTeam"
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: props?.siteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: state.sendEmailTitle, // Match index dynamically
                        Details: `Send Email Assigned Team to ${state.sendEmailTo}`,
                        StateId: props.siteMasterId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                    // SPComponentLoader.loadCss(require("../../../assets/css/pdfnone.css"));
                }).catch(err => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickCancel();
                setIsLoading(false);
                // setIsPdfGenerating(false);
            }).catch(err => console.log(err));
        } else {
            setIsLoading(false);

        }
    };

    const onClickDownloadPDF = async (): Promise<void> => {
        setIsLoading(true);
        setIsPdfGenerating(true);
        const fileName = `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Assigned Team' : 'Assigned Team'}`;
        const dataToExport: any = state?.selectedItem?.length > 0 ? state?.selectedItem : state?.filterAssociatedTeamItems;
        try {
            const fileblob: any = await generateAndSaveKendoPDF("AssignedTeamPDF", fileName, dataToExport);
            const url = window.URL.createObjectURL(fileblob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsPdfGenerating(false);
        }
    };

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setState((prevState) => ({ ...prevState, sendEmailTo: newValue || "" }));
        if (newValue) {
            setState((prevState: any) => ({ ...prevState, isShowErrorEmail: false }))
        }

        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        if (!enteredValue || emailPattern.test(enteredValue)) {
            setState((prevState: any) => ({ ...prevState, isShowError: false }))
        } else {
            setState((prevState: any) => ({ ...prevState, isShowError: true }))
        }
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!!newValue) {
            setState((prevState) => ({ ...prevState, sendEmailTitle: newValue }));
        } else {
            setState((prevState) => ({ ...prevState, sendEmailTitle: "", isShowErrorTitle: false }));
        }


    }
    const onclickExportToExcel = async () => {
        setIsLoading(true);
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Site Name",
                    key: "SiteName"
                },
                {
                    header: "State Name",
                    key: "StateName"
                },
                {
                    header: "Employee Name",
                    key: "title"
                },
                {
                    header: "Role",
                    key: "aTRole"
                },
                {
                    header: "Date Of Birth",
                    key: "FormatDateOfBirth"
                },
                {
                    header: "Location",
                    key: "LocationCommaSeprate"
                },
                {
                    header: "Operator Type",
                    key: "OperatorType"
                },
                {
                    header: "Skill Set",
                    key: "SkillsCommaSeprate"
                },
            ];
            const fileName = `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Assigned Team.xlsx' : 'Assigned Team.xlsx'}`;
            const dataToExport = state?.selectedItem?.length > 0 ? state?.selectedItem : state?.filterAssociatedTeamItems;
            generateExcelTable(dataToExport, exportColumns, fileName);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { onClickDownloadPDF() },
            },
            {
                key: "exportExcel",
                text: "Export to Excel",
                iconProps: { iconName: "ExcelDocument", style: { color: "orange" } },
                onClick: (ev, item) => { onclickExportToExcel() },
            },
        ],
    };
    const onClickEmailButton = () => {
        setState((prevState: any) => ({ ...prevState, isSendEmailModelShow: true }))

    }

    const onClickCancel = () => {
        setState((prevState: any) => ({
            ...prevState,
            sendEmailTitle: "",
            sendEmailTo: "",
            isShowErrorTitle: false,
            isShowErrorEmail: false,
            isShowError: false,
            isSendEmailModelShow: false
        }))
    }
    const handleSaveAndClose = () => {
        setIsNotesPanelOpen(false); // ✅ closes the panel
    };
    React.useEffect(() => {
        // _getSkillSetData();
        // _getDocumentData();
        // _getSkillSetData();
    }, [state.isReload, isRefreshGrid]);



    const sortAssignedTeamByIndex = (a: any, b: any) => {
        const aIndex = a?.Index;
        const bIndex = b?.Index;
        const aIsValidNumber =
            aIndex !== null &&
            aIndex !== undefined &&
            aIndex !== "" &&
            Number.isFinite(Number(aIndex));
        const bIsValidNumber =
            bIndex !== null &&
            bIndex !== undefined &&
            bIndex !== "" &&
            Number.isFinite(Number(bIndex));
        // 1️⃣ Both have valid numeric Index → sort ascending
        if (aIsValidNumber && bIsValidNumber) {
            return Number(aIndex) - Number(bIndex);
        }
        // 2️⃣ Only A has valid Index → A first
        if (aIsValidNumber && !bIsValidNumber) return -1;
        // 3️⃣ Only B has valid Index → B first
        if (!aIsValidNumber && bIsValidNumber) return 1;
        // 4️⃣ Both invalid → sort by id DESC
        const aId = Number(a?.id) || 0;
        const bId = Number(b?.id) || 0;
        return bId - aId;
    };




    React.useEffect(() => {
        try {
            void (async () => {
                setIsLoading(true);
                let i = 0;
                i = i + 1;

                const [siteAssociatedTeam] = await Promise.all([getStateAssociatedTeam()]);
                let column = genrateColumn();
                let assignedTeam: IAssociatedTeam[] = [];
                const userIds = siteAssociatedTeam.filter((item: any) => !!item.UserId).map(item => Number(String(item.UserId).replace(/,/g, '').trim()));

                let employeeDOBMap: Record<number, { DateOfBirth: string | null, Skills: any[] }> = {};
                let filteredEmployees: any[] = [];
                if (userIds.length > 0) {
                    // const dobFilter = userIds.map(id => `Id eq ${id}`).join(" or ");
                    const empDobQuery: IPnPQueryOptions = {
                        select: ["Id", "DateOfBirth", "Skills", 'Profile', 'Notes'],
                        // filter: "IsDeleted ne 1 and Inactive ne 1",
                        // filter: "(IsDeleted eq 1 or IsDeleted eq null) and (Inactive eq 0 or Inactive eq null)",
                        // filter: "(Inactive eq 0 or Inactive eq null)",
                        listName: ListNames.QuaycleanEmployee
                    };
                    const empResponse = await props.provider.getItemsByQuery(empDobQuery);
                    filteredEmployees = empResponse.filter(emp => userIds.includes(emp.Id));
                    // const empResponse = await props.provider.getItemsByQuery(empDobQuery);
                    employeeDOBMap = filteredEmployees?.reduce((acc: any, emp: any) => {
                        const skillsArray: any[] = [];
                        if (emp.Skills) {
                            const skills = emp.Skills.trim();
                            if (skills) {
                                try {
                                    const skillsData = JSON.parse(skills);
                                    skillsData?.forEach((skill: any) => {
                                        skillsArray.push({
                                            Title: skill?.SkillName || "",
                                            ExpiryDate: skill?.ExpiryDate ? moment(skill?.ExpiryDate).format('DD-MM-YYYY') : "",
                                            CardNumber: skill?.DocumentNumber || "",
                                            isNew: false
                                        });
                                    });
                                } catch (error) {
                                    console.error("Invalid JSON for employee ID:", emp.Id, error);
                                }
                            }
                        }
                        acc[emp.Id] = { DateOfBirth: emp.DateOfBirth || null, Skills: skillsArray };
                        return acc;
                    }, {});
                }

                if (!!siteAssociatedTeam && siteAssociatedTeam?.length > 0) {
                    assignedTeam = siteAssociatedTeam.map((data: any) => {
                        let attachmentFiledata: any;
                        // if (data.AttachmentFiles.length > 0) {
                        //     const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + data.Id + "/";
                        //     try {
                        //         const AttachmentData = data.AttachmentFiles[0];
                        //         if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                        //             attachmentFiledata = AttachmentData.ServerRelativeUrl;
                        //         } else if (AttachmentData && AttachmentData.FileName) {
                        //             attachmentFiledata = fixImgURL + AttachmentData.FileName;
                        //         } else {
                        //             attachmentFiledata = "";
                        //         }
                        //     } catch (error) {
                        //         console.error("Error parsing AssetPhoto JSON:", error);
                        //         attachmentFiledata = "";
                        //     }
                        // } else {
                        //     attachmentFiledata = null;
                        // }
                        const parsedUserId = Number(String(data.UserId).replace(/,/g, '').trim());
                        const employeeData = employeeDOBMap[parsedUserId];
                        let profilerData = (!!filteredEmployees && filteredEmployees.length > 0) ? filteredEmployees.find(i => i.Id == parsedUserId) : ""
                        let notes: string = data.Notes
                        if (!!profilerData && !!profilerData?.Profile) {
                            let obj = JSON.parse(profilerData?.Profile) || "";

                            // if (!!obj && obj?.fileName) {
                            //     const fixImgURL = props.context.pageContext.web.serverRelativeUrl + `/Lists/${ListNames.QuaycleanEmployeeInt}/Attachments/` + parsedUserId + "/";

                            //     attachmentFiledata = `${fixImgURL}/${obj?.fileName}`
                            // }
                            if (!!obj && obj?.serverRelativeUrl) {
                                attachmentFiledata = obj?.serverRelativeUrl || ""
                            }
                            if (!!profilerData.Notes) {
                                notes = profilerData.Notes || ""
                            }
                        }
                        return {
                            id: data.ID,
                            title: !!data.Title ? data.Title : "",
                            Index: data?.Index ? parseIndianFormattedNumber(data?.Index) : null,
                            aTUserName: !!data.ATUserName ? data.ATUserName : "",
                            aTRole: !!data.ATRole ? data.ATRole : "",
                            StateName: data.StateName || "",
                            SiteNameId: !!data.SiteName ? data.SiteName[0].lookupId : '',
                            // siteNameId: data.SiteNameId ? data.SiteNameId : "",
                            Notes: notes || "",
                            attachmentURl: attachmentFiledata || blankProfile,
                            SkillSet: !!data.SkillSet ? data.SkillSet : "",
                            OperatorType: !!data?.OperatorType ? data?.OperatorType?.join(', ') : "",
                            SiteName: !!data.SiteName ? data.SiteName[0].lookupValue : '',
                            Email: data.Email ? data.Email : "",
                            UserId: data.UserId ? Number(String(data.UserId).replace(/,/g, '').trim()) : "",
                            Location: !!data?.Location ? data?.Location : [],
                            // DateOfBirth: employeeDOBMap[data?.UserId] ? employeeDOBMap[data?.UserId] : undefined,
                            DateOfBirth: employeeData?.DateOfBirth,
                            Skills: employeeData?.Skills || [],
                            SkillsCommaSeprate: !!employeeData?.Skills?.length ? employeeData.Skills?.map(skill => `Title: ${skill?.Title}, CardNumber: ${skill?.CardNumber}, ExpiryDate: ${skill?.ExpiryDate}`).join('\n') : null,
                            LocationCommaSeprate: !!data?.Location ? data?.Location?.join(', ') : null,
                            FormatDateOfBirth: !!employeeData?.DateOfBirth ? moment(employeeData?.DateOfBirth).format(DateFormat) : undefined
                        };
                    });
                }

                let filteredData: any[];
                if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                    filteredData = assignedTeam;
                } else {
                    let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                    filteredData = !!assignedTeam && assignedTeam?.filter(item =>
                        AllSiteIds.includes(item?.siteNameId)
                    );
                }

                // const sortedData = filteredData.map((item: any) => ({
                //     ...item,
                //     Index: item?.Index === "" ? Infinity : Number(item?.Index)
                // })).sort((a, b) => a.Index - b.Index);
                // const emailArray: string[] = sortedData.map(item => item.Email.trim());
                // setEmailArray(emailArray);
                // console.log(emailArray);
                const sortedAssignedTeam = [...assignedTeam].sort(sortAssignedTeamByIndex);
                filteredData = sortedAssignedTeam;
                if (state.searchText) {
                    filteredData = onSearch(sortedAssignedTeam, state.searchText);
                }
                const emailArray: string[] = sortedAssignedTeam.map((item: any) => (item?.Email || "").toString().trim());
                setState((prevState: any) => ({ ...prevState, column: column, associatedTeamItems: sortedAssignedTeam, filterAssociatedTeamItems: filteredData, keyUpdate: Math.random() }));
                setEmailArray(emailArray);

                if (i == 2) {
                    setIsLoading(false);
                } else {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 2000);
                }
            })();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect AssignedTeam"
            };
            void logGenerator(provider, errorObj);
        }
    }, [state.isReload, allFileData, isRefreshGrid, selectedSiteIds, selectedZoneDetails]);


    const _onSearchTextChange = (text: any) => {
        setState((prevState) => ({ ...prevState, searchText: text }))
        let filteredData: any[] = state.associatedTeamItems
        if (!!text) {
            filteredData = onSearch(state.associatedTeamItems, text);

        }

        const sortedAssignedTeam = [...filteredData].sort(sortAssignedTeamByIndex);
        setState((prevState) => ({ ...prevState, filterAssociatedTeamItems: sortedAssignedTeam }))


        return text;
    };

    // React.useEffect(() => {
    //     loadAssignedTeam();
    // }, [state.isReload, allFileData, isRefreshGrid, selectedSiteIds, selectedZoneDetails]);

    if (hasError) {
        return <div className="boxCard mt-10">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isErrorModelOpen && <CustomModal closeButtonText="Close" isModalOpenProps={isErrorModelOpen} setModalpopUpFalse={() => { setIsErrorModelOpen(false); }} subject={"Something went wrong."} message={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}
            {isLoading && <Loader />}
            {state.isDeleteModelOpen && <CustomModal isModalOpenProps={state.isDeleteModelOpen} setModalpopUpFalse={closeModel} subject={"Delete Items"} message={'Are You Sure to Delete item! '} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onClickDeleteIcon} />}
            {state.isAddTeamPhotoModelOpen && < AddTeamPhoto teamPhotoId={state?.teamPhotoId} isUpdate={state?.isUpdateTeamPhoto}
                provider={provider} context={props.context} qCState={props.qCState} siteMasterId={props.siteMasterId} isModelOpen={state.isAddTeamPhotoModelOpen} onCloseClick={closeModel} />}
            {state.isAddNewMemberModelOpen && <AddNewMember
                isNewUserAdd={state.isNewUserAdd}
                associatedEditobj={!!UpdateItem ? UpdateItem : {}}
                qCState={props.qCState}
                qCStateId={props.qCStateId}
                EmailArray={EmailArray}
                siteMasterId={props.siteMasterId}
                provider={provider} manageComponentView={props.manageComponentView}
                isModelOpen={state.isAddNewMemberModelOpen}
                closeModel={closeModel} context={props.context}
                loginUserRoleDetails={props?.loginUserRoleDetails}
                selectedZoneDetails={selectedZoneDetails}
                isReload={state.isReload}
                CloseModelNewMember={CloseModelNewMember}
            />}
            <div className={isSiteLevelComponent ? "" : "boxCard boxCard-mt-0"}>
                {!isSiteLevelComponent && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Assigned Team</h1>
                    </div>
                </div>}
                <div className="formGroup more-page-wrapper">
                    <div className="ms-Grid mt-15">
                        <div className="ms-Grid-row filtermrg">

                            {!isSiteLevelComponent && <div className="ms-Grid-col ms-sm12 ms-md2 ms-lg2 ms-xl2">
                                <MultipleSiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSiteIds={selectedSiteIds}
                                    selectedSiteTitles={selectedSiteTitles}
                                    selectedSCSite={selectedSCSites}
                                    onSiteChange={handleSiteChange}
                                    provider={provider}
                                    isRequired={true}
                                    AllOption={true}
                                />

                            </div>}
                        </div>
                    </div >
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <div className="mt-3 dflex justifyContentBetween">
                                    <SearchBox
                                        value={state?.searchText || ""}
                                        styles={searchBoxStyles}
                                        // autoFocus={!!searchText ? true : false}
                                        placeholder="Search"
                                        onEscape={(ev: any) => { console.log('Custom onEscape Called'); }}
                                        onClear={(ev: any) => {
                                            console.log('Custom onClear Called');
                                        }}
                                        onChange={(_, newValue) => _onSearchTextChange(newValue)}
                                        onSearch={_onSearchTextChange}
                                    />
                                    {isVisibleCrud.current ? <div className="justifyright ">
                                        {(isDisplayEDbtn && isVisibleCrud.current) && <>
                                            <div className='dflex mr-10'>
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
                                        <Link className="actionBtn iconSize btnRefresh mt3 icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                            text="">
                                            <TooltipHost
                                                content={"Refresh Grid"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"arrows-rotate"}
                                                />
                                            </TooltipHost>    </Link>
                                        {state?.filterAssociatedTeamItems?.length > 0 && <Link className="btn-back-ml-4 dticon">
                                            <TooltipHost content="Export options">
                                                <DefaultButton
                                                    text="Export"
                                                    iconProps={{ iconName: "Download" }}
                                                    menuProps={menuProps}
                                                    className="btn export-btn-primary"
                                                />
                                            </TooltipHost>
                                        </Link>}
                                        {(isVisibleCrud.current && state?.filterAssociatedTeamItems?.length > 0) &&

                                            <TooltipHost
                                                content={"Send Email With PDF"}
                                                id={tooltipId}>
                                                <div className="">
                                                    <CommonPopup
                                                        data={state.selectedItem}
                                                        isPopupVisible={state.isSendEmailModelShow}
                                                        isPrice={false}
                                                        hidePopup={onClickCancel}
                                                        title={state.sendEmailTitle}
                                                        sendToEmail={state.sendEmailTo}
                                                        onChangeTitle={onChangeTitle}
                                                        onChangeSendToEmail={onChangeSendToEmail}
                                                        displayerrortitle={state.isShowErrorTitle}
                                                        displayerroremail={state.isShowErrorEmail}
                                                        displayerror={state.isShowError}
                                                        onClickSendEmail={onClickSendEmail}
                                                        onClickCancel={onClickCancel}
                                                        onclickSendEmail={onClickEmailButton}
                                                        onToggleChange={undefined}
                                                    />
                                                </div>
                                            </TooltipHost>
                                        }
                                        {isVisibleCrud.current &&
                                            <PrimaryButton text="Add" disabled={isDisplayEDbtn} className={!isDisplayEDbtn ? "btn btn-primary" : ""} onClick={() => {
                                                setUpdateItem(null);
                                                setState(prevState => ({ ...prevState, isAddNewMemberModelOpen: true, isNewUserAdd: true, }));
                                            }} />}
                                        <div className="grid-list-view">
                                            <Link className={`grid-list-btn ${viewType === "grid" ? "active" : ""}`}
                                                onClick={() => {
                                                    draggableListRef.current?.clearSelectedRecords();
                                                    setViewType("grid");
                                                }}
                                            >
                                                <TooltipHost content={"List View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="list" />
                                                </TooltipHost>
                                            </Link>
                                            <Link
                                                className={`grid-list-btn ${viewType === "card" ? "active" : ""}`}
                                                onClick={() => {
                                                    draggableListRef.current?.clearSelectedRecords();
                                                    setViewType("card");
                                                }}>
                                                <TooltipHost content={"Card View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="th" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    </div>
                                        : ((state?.filterAssociatedTeamItems?.length > 0) && <div className="justifyright ">
                                            <Link className="btn-back-ml-4 dticon">
                                                <TooltipHost content="Export options">
                                                    <DefaultButton
                                                        text="Export"
                                                        iconProps={{ iconName: "Download" }}
                                                        menuProps={menuProps}
                                                        className="btn export-btn-primary"
                                                    />
                                                </TooltipHost>
                                            </Link>
                                            <TooltipHost
                                                content={"Send Email With PDF"}
                                                id={tooltipId}>
                                                <div className="">
                                                    <CommonPopup
                                                        data={state.selectedItem}
                                                        isPopupVisible={state.isSendEmailModelShow}
                                                        isPrice={false}
                                                        hidePopup={onClickCancel}
                                                        title={state.sendEmailTitle}
                                                        sendToEmail={state.sendEmailTo}
                                                        onChangeTitle={onChangeTitle}
                                                        onChangeSendToEmail={onChangeSendToEmail}
                                                        displayerrortitle={state.isShowErrorTitle}
                                                        displayerroremail={state.isShowErrorEmail}
                                                        displayerror={state.isShowError}
                                                        onClickSendEmail={onClickSendEmail}
                                                        onClickCancel={onClickCancel}
                                                        onclickSendEmail={onClickEmailButton}
                                                        onToggleChange={undefined}
                                                    />
                                                </div>
                                            </TooltipHost>
                                            <div className="grid-list-view">
                                                <Link className={`grid-list-btn ${viewType === "grid" ? "active" : ""}`}
                                                    onClick={() => {
                                                        draggableListRef.current?.clearSelectedRecords();
                                                        setViewType("grid");
                                                    }}
                                                >
                                                    <TooltipHost content={"List View"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="list" />
                                                    </TooltipHost>
                                                </Link>
                                                <Link
                                                    className={`grid-list-btn ${viewType === "card" ? "active" : ""}`}
                                                    onClick={() => {
                                                        draggableListRef.current?.clearSelectedRecords();
                                                        setViewType("card");
                                                    }}>
                                                    <TooltipHost content={"Card View"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="th" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>

                                        </div>)
                                    }
                                </div>
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mt-2">
                                {
                                    <DraggableList
                                        ref={draggableListRef}
                                        // onclickEdit={onclickEdit}
                                        // onclickconfirmdelete={onclickconfirmdelete}
                                        onDoubleClick={openEmployeePanel}
                                        provider={provider}
                                        data={state.filterAssociatedTeamItems}
                                        SkillSetData={allSkillSetData}
                                        FileData={allFileData}
                                        onSelectedRecordsChange={handleSelectedRecordsChange}
                                        flag={flag}
                                        IsSubLocation={IsSubLocation}
                                        isSiteName={selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length == 1 ? true : false}
                                        setFlag={setFlag}
                                        viewType={viewType} />
                                }

                            </div>
                            <Panel
                                className="assigned-Team-Panel"
                                isOpen={isNotesPanelOpen}
                                onDismiss={() => {
                                    setIsNotesPanelOpen(false);
                                    draggableListRef.current?.clearSelectedRecords();
                                }}
                                headerText={"Employee Profile"}
                                type={PanelType.custom}
                                closeButtonAriaLabel="Close"
                                customWidth="480px"
                            >
                                <div className="text-align-center" style={{ marginBottom: "10px" }}>
                                    <LazyLoadImage
                                        src={UpdateItem?.attachmentURl || blankProfile}
                                        width={150}
                                        height={150}
                                        alt={UpdateItem?.aTUserName}
                                        className="AT-img UImage"
                                        placeholderSrc={blankProfile}
                                        effect="blur"
                                    />
                                </div>

                                <div className="assigned-Team-table">
                                    <table className="mt-4 inspection-border">
                                        <tbody>
                                            <tr>
                                                <td className="actlbl">Employee Name</td>
                                                <td className="padleft-Inspection">{UpdateItem?.aTUserName}</td>
                                            </tr>
                                            <tr>
                                                <td className="actlbl">Role</td>
                                                <td className="padleft-Inspection">{UpdateItem?.aTRole}</td>
                                            </tr>
                                            {UpdateItem?.DateOfBirth && (
                                                <tr>
                                                    <td className="actlbl">Date Of Birth</td>
                                                    <td className="padleft-Inspection">{moment(UpdateItem?.DateOfBirth).format(DateFormat)}</td>
                                                </tr>
                                            )}
                                            {UpdateItem?.OperatorType && (
                                                <tr>
                                                    <td className="actlbl">Operator Type</td>
                                                    <td className="padleft-Inspection">{UpdateItem?.OperatorType}</td>
                                                </tr>
                                            )}
                                            {IsSubLocation && (!!UpdateItem?.Location && UpdateItem?.Location.length > 0) && (
                                                <tr>
                                                    {/* <td colSpan={2} className="actlbl">Location</td> */}
                                                    <td colSpan={2}>
                                                        <span className="actlbl">Location</span>
                                                        <ul className="location-list">
                                                            {UpdateItem?.Location.map((loc: any, index: number) => (
                                                                <li key={index} className="AT-Par">{loc}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )}
                                            {/* {allSkillSetData?.filter((r: any) => r.AssociatedTeamId === UpdateItem?.id).length > 0 && (
                                                <tr>
                                                    <td colSpan={2}>
                                                        <span className="actlbl">Skill Sets</span>
                                                        <ul className="skillsetBadgeUL">
                                                            {allSkillSetData
                                                                .filter((r: any) => r.AssociatedTeamId === UpdateItem?.id)
                                                                .map((skill: any) => (
                                                                    <li key={skill.id} className="ss-mb5 skillsetBadge">
                                                                        <span style={{ fontWeight: "bold" }}>{skill.Title}</span><br />
                                                                        <span className="EDLBL">{skill.CardNumber}</span><br />
                                                                        <span className="EDLBL">{skill.ExpiryDate}</span>
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )} */}
                                            {UpdateItem?.Skills?.length > 0 && (
                                                <tr>
                                                    <td colSpan={2}>
                                                        <span className="actlbl">Skill Sets</span>
                                                        <ul className="skillsetBadgeUL">
                                                            {UpdateItem?.Skills?.map((skill: any) => (
                                                                <li key={skill.id} className="ss-mb5 skillsetBadge">
                                                                    <span style={{ fontWeight: "bold" }}>{skill.Title}</span><br />
                                                                    <span className="EDLBL">{skill.CardNumber}</span><br />
                                                                    <span className="EDLBL">{skill.ExpiryDate}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )}
                                            {Notes && Notes !== "" && (
                                                <tr>
                                                    <td colSpan={2}>
                                                        <span className="actlbl">Profile Notes</span><br></br>
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: Notes
                                                            }}
                                                        ></span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
            </div >
            {isPdfGenerating && (
                <AssignedTeamPDF
                    fileData={state?.filterAssociatedTeamItems}
                    allSkillSetData={allSkillSetData}
                    key={state.keyUpdate}
                    // siteName={props?.siteName || ""}
                    // qCState={props?.qCState}
                    assignedTeam={(state.selectedItem && state.selectedItem.length > 0) ? state.selectedItem : (state.filterAssociatedTeamItems || [])}
                    imgLogo={imgLogo}
                />)
            }
            <Panel
                isOpen={showModal}
                onDismiss={() => closeModal()}
                type={PanelType.extraLarge}
                headerText="Document View"
            >
                <iframe src={fileURL} style={{ width: "100%", height: "90vh" }} />
            </Panel>
        </>;
    }

};


