import React from "react";
import { IManageSitesCrudProps } from "./ManageSitesCrud";
import { ISitesMasterCrud } from "../../IMangeSites";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { logGenerator, mapSingleValue, UserActivityLog } from "../../../../../../../Common/Util";
import { DataType } from "../../../../../../../Common/Constants/CommonConstants";
import { toastService } from "../../../../../../../Common/ToastService";
import { getHazardQRCodeURL } from "../../../../CommonComponents/CommonMethods";
const notFoundImage = require('../../../../../assets/images/sitelogo.jpg');
const notFoundImageQR = require('../../../../../assets/images/NotFoundImg.png');
export interface IManageSitesCrudDataState {
    isLoading: boolean;
    siteMasterItems: ISitesMasterCrud;
    isAddDialogShow: boolean;
    isAddNew: boolean;
    type: string;
    columnName: string;
    addItemId: number;
    addItemEmail: string;
    isDeleteDialogOpen: boolean;
    deleteItemId: number;
    columnNameDelete: string;
    isReload: boolean;
    isShowError: boolean;
    isHazardQrModelOpen?: any;
    HazardQRCodeImage?: any;

}

export const ManageSitesCrudData = (props: IManageSitesCrudProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const scrollTopRef = React.useRef<null | HTMLDivElement>(null);
    const [state, setState] = React.useState<IManageSitesCrudDataState>({
        isLoading: false,
        siteMasterItems: {
            siteImageUrl: "",
            JobCode: "",
            SCSiteId: "",
            QCStateName: "",
            QCStateId: 0,
            SiteSupervisorId: [],
            SiteManagerId: [],
            ADUserId: [],
            Category: "",
            Title: "",
            Id: 0,
            ExistingSiteLink: "",
            Periodic: false,
            HelpDesk: false,
            ClientResponse: false,
            JobControlChecklist: false,
            eLearning: false,
            ManageEvents: false,
            IsResourceRecovery: false,
            SubLocation: false,
            SSWasteReport: false,
            AmenitiesFeedbackForm: false,
            IsDailyCleaningDuties: false,
            DynamicSiteManager: ''
        },
        isAddDialogShow: false,
        isAddNew: false,
        type: "",
        columnName: "",
        isDeleteDialogOpen: false,
        columnNameDelete: "",
        deleteItemId: 0,
        isReload: false,
        isShowError: false,
        addItemId: 0,
        addItemEmail: "",
        isHazardQrModelOpen: false,
        HazardQRCodeImage: ''
    });

    const getSiteMasterItems = async (itemId: number) => {
        let item: ISitesMasterCrud = state.siteMasterItems;
        if (!!itemId && itemId > 0) {

            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ["Id,Title,eLearning,SiteSupervisorId,SiteImage,SCSiteId,SubLocation,ExistingSiteLink,SiteSupervisor/EMail,JobCode,SiteSupervisor/Id,SiteManagerId,SiteSupervisor/Title,SiteManager/Title,SiteManager/Id,SiteManager/EMail,ADUserId,ADUser/Id,ADUser/Name,ADUser/Title, Category,QCStateId,QCState/Title,Periodic,HelpDesk,ClientResponse,JobControlChecklist,ManageEvents,IsResourceRecovery,SSWasteReport,AmenitiesFeedbackForm,IsDailyCleaningDuties,DynamicSiteManager/Title,DynamicSiteManager/Id,DynamicSiteManager/EMail"],
                expand: ["QCState,SiteSupervisor,SiteManager,ADUser,DynamicSiteManager"],
                id: Number(itemId)
            }
            let data = await provider.getByItemByIDQuery(queryOptions);
            if (!!data) {
                let siteImageUrl: string = "";
                const fixImgURL = context.pageContext.web.serverRelativeUrl + '/Lists/SitesMaster/Attachments/' + data.Id + "/";
                if (data?.SiteImage) {
                    try {
                        const SitePhotoData = JSON?.parse(data?.SiteImage);
                        if (SitePhotoData && SitePhotoData?.serverRelativeUrl) {
                            siteImageUrl = SitePhotoData?.serverRelativeUrl;
                        } else if (SitePhotoData && SitePhotoData?.fileName) {
                            siteImageUrl = fixImgURL + SitePhotoData?.fileName;
                        } else {
                            siteImageUrl = notFoundImage;
                        }
                    } catch (error) {
                        // console.error("Error parsing QRCodePhotoData JSON:", error);
                        siteImageUrl = notFoundImage;
                    }
                } else {
                    siteImageUrl = notFoundImage;
                }
                item = {
                    ExistingSiteLink: !!data.ExistingSiteLink ? data.ExistingSiteLink : "",
                    QCStateName: !!data.QCStateId ? data?.QCState?.Title : "",
                    QCStateId: !!data.QCStateId ? data?.QCStateId : "",
                    SiteSupervisorId: !!data.SiteSupervisorId ? mapSingleValue(data.SiteSupervisor, DataType.peopleExpandMuilt) : [],
                    SiteManagerId: !!data.SiteManagerId ? mapSingleValue(data.SiteManager, DataType.peopleExpandMuilt) : [],
                    ADUserId: !!data.ADUserId ? mapSingleValue(data.ADUser, DataType.peopleExpandMuilt) : [],
                    Category: !!data.Category ? data?.Category : "",
                    Title: !!data.Title ? data?.Title : "",
                    Id: !!data.Id ? data?.Id : "",
                    siteImageUrl: siteImageUrl,
                    JobCode: !!data.JobCode ? data.JobCode : "",
                    SCSiteId: !!data.SCSiteId ? data.SCSiteId : "",
                    Periodic: !!data.Periodic ? data.Periodic : false,
                    HelpDesk: !!data.HelpDesk ? data.HelpDesk : false,
                    ClientResponse: !!data.ClientResponse ? data.ClientResponse : false,
                    JobControlChecklist: !!data.JobControlChecklist ? data.JobControlChecklist : false,
                    ManageEvents: !!data.ManageEvents ? data.ManageEvents : false,
                    IsResourceRecovery: !!data?.IsResourceRecovery ? data?.IsResourceRecovery : false,
                    eLearning: !!data.eLearning ? data.eLearning : false,
                    SubLocation: !!data.SubLocation ? data.SubLocation : false,
                    SSWasteReport: !!data.SSWasteReport ? data.SSWasteReport : false,
                    AmenitiesFeedbackForm: !!data.AmenitiesFeedbackForm ? data.AmenitiesFeedbackForm : false,
                    IsDailyCleaningDuties: !!data.IsDailyCleaningDuties ? data.IsDailyCleaningDuties : false,
                    DynamicSiteManager: !!data.DynamicSiteManager ? data.DynamicSiteManager?.Title : ''
                }
            }
            return item;
        }

    }
    const handleDownload = () => {
        if (props.qrCodeSrc) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>QR Code</title>
                            <style>
                                body { text-align: center; margin-top: 50px; }
                                img { border: 1px solid #ccc; border-radius: 8px; }
                            </style>
                        </head>
                        <body>
                            <img src="${props.qrCodeSrc}" alt="QR Code" />
                            <script>
                                window.onload = function() {
                                    window.print();
                                    window.close();
                                };
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };


    const onClickCloseAddNew = () => {
        setState((prevState: any) => ({ ...prevState, isAddDialogShow: false, isAddNew: false, addItemEmail: "", addItemId: 0, isShowError: false }));
    }

    const onCloseDeleteDialog = () => {
        setState((prevState: any) => ({ ...prevState, isDeleteDialogOpen: false, deleteItemId: 0, columnNameDelete: "" }));
    }

    const onClickDeleteButton = (Id: number, columnName: string) => {
        setState((prevState: any) => ({ ...prevState, isDeleteDialogOpen: true, deleteItemId: Id, columnNameDelete: columnName }));
    }

    const handleDownloadQR = () => {
        const link = document.createElement('a');
        link.href = props.qrCodeSrc || ""; // image in public/images folder
        link.download = state.siteMasterItems?.Title ? `${state.siteMasterItems?.Title}.jpg` : 'QRCode.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const onClickYesDelete = async () => {
        setState((prevState) => ({ ...prevState, isLoading: true }));
        const toastId = toastService.loading('Loading...');
        try {
            if (!!state.deleteItemId && state.deleteItemId > 0) {
                let userId: any[] = [];
                switch (state.columnNameDelete) {
                    case "SiteManagerId":
                        userId = state.siteMasterItems.SiteManagerId.map((r) => r.Id)
                        break;
                    case "SiteSupervisorId":
                        userId = state.siteMasterItems.SiteSupervisorId.map((r) => r.Id)
                        break;
                    case "ADUserId":
                        userId = state.siteMasterItems.ADUserId.map((r) => r.Id)
                        break;

                    default:
                        break;
                }

                let removedUserData = userId.filter((i) => i != state.deleteItemId);

                let object = {
                    [state.columnNameDelete]: removedUserData
                }
                await provider.updateItem(object, ListNames.SitesMaster, Number(props.siteMasterId));
                const logObj = {
                    UserName: currentUserRoleDetail.title,
                    SiteNameId: Number(props.siteMasterId),
                    ActionType: "Delete",
                    EntityType: UserActionEntityTypeEnum.Site,
                    EntityId: Number(props?.siteMasterId),
                    EntityName: state?.siteMasterItems?.Title,
                    StateId: state?.siteMasterItems?.QCStateId,
                    Details: `Manage Site Remove Users `
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
                toastService.updateLoadingWithSuccess(toastId, "item deleted successfully!");

            }
            if (!!props.onClickReload) {
                props.onClickReload()
            }
            setState((prevState) => ({ ...prevState, isLoading: false, isDeleteDialogOpen: false, isReload: !prevState.isReload, deleteItemId: 0, columnNameDelete: "" }));
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setState((prevState) => ({ ...prevState, isLoading: false }));

        }
    }

    const onClickAddEdit = (isAddNew: boolean, columnName: string, type: string,) => {
        setState((prevState: any) => ({ ...prevState, isAddDialogShow: true, isAddNew: isAddNew, columnName: columnName, type: type }));
    }

    const onPeoplePickerChange = (items: any[]) => {
        let addItemId: any = 0;
        let addItemEmail: string = ""
        if (items.length > 0) {
            let isUserAvailable: boolean = false;
            let userId: any[] = [];
            switch (state.columnName) {
                case "SiteManagerId":
                    userId = state.siteMasterItems.SiteManagerId.map((r) => r.Id)
                    break;
                case "SiteSupervisorId":
                    userId = state.siteMasterItems.SiteSupervisorId.map((r) => r.Id)
                    break;
                case "ADUserId":
                    userId = state.siteMasterItems.ADUserId.map((r) => r.Id)
                    break;

                default:
                    break;
            }
            if (userId.length == 0) {

                isUserAvailable = false;
            } else if (userId.indexOf(items[0].id) > -1) {
                isUserAvailable = true;
            }
            if (isUserAvailable == false) {
                addItemId = items[0].id;
                addItemEmail = items[0].secondaryText
                setState((prevState) => ({ ...prevState, addItemId: addItemId, isShowError: isUserAvailable, addItemEmail: addItemEmail }))
            } else {
                setState((prevState) => ({ ...prevState, isShowError: isUserAvailable, }))
            }


        }
    };

    const onClickSaveDialog = async () => {
        setState((prevState) => ({ ...prevState, isLoading: true }));
        const toastId = toastService.loading('Loading...');
        try {
            if (!!state.addItemId && state.addItemId > 0) {
                let userId: any[] = [];
                switch (state.columnName) {
                    case "SiteManagerId":
                        userId = state.siteMasterItems.SiteManagerId.map((r) => r.Id)
                        break;
                    case "SiteSupervisorId":
                        userId = state.siteMasterItems.SiteSupervisorId.map((r) => r.Id)
                        break;
                    case "ADUserId":
                        userId = state.siteMasterItems.ADUserId.map((r) => r.Id)
                        break;

                    default:
                        break;
                }

                let addUserData = [...userId, state.addItemId]

                let object = {
                    [state.columnName]: addUserData
                }
                await provider.updateItem(object, ListNames.SitesMaster, Number(props.siteMasterId))
                const logObj = {
                    UserName: currentUserRoleDetail.title,
                    SiteNameId: Number(props.siteMasterId),
                    ActionType: "Update",
                    EntityType: UserActionEntityTypeEnum.Site,
                    EntityId: Number(props?.siteMasterId),
                    EntityName: state?.siteMasterItems?.Title,
                    StateId: state?.siteMasterItems?.QCStateId,
                    Details: `Manage Site Update`
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
                toastService.updateLoadingWithSuccess(toastId, "item Add successfully!");
            }
            if (!!props.onClickReload) {
                props.onClickReload()
            }
            setState((prevState) => ({ ...prevState, isLoading: false, isAddDialogShow: false, isReload: !prevState.isReload, addItemId: 0, columnName: "" }));
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setState((prevState) => ({ ...prevState, isLoading: false }));

        }

    }


    React.useEffect(() => {
        (async () => {
            try {
                // let qrCodeURL = "";
                // try {
                //     qrCodeURL = await getHazardQRCodeURL(context, props.siteMasterId);
                // } catch (err) {
                //     console.error("Error generating Hazard QR code:", err);
                //     qrCodeURL = notFoundImageQR;
                // }
                // setState((prevState) => ({ ...prevState, isLoading: true, HazardQRCodeImage: qrCodeURL }));
                const [siteItems] = await Promise.all([getSiteMasterItems(props.siteMasterId)]);
                if (!props.isSiteInformationView) {
                    setTimeout(() => {
                        scrollTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                }
                setState((prevState: any) => ({ ...prevState, isLoading: false, siteMasterItems: siteItems }));

            } catch (error) {
                setState((prevState) => ({ ...prevState, isLoading: false }));
                console.log("useEffect" + error);
            }
        })();

    }, [props.siteMasterId, state.isReload]);
    const oncloseHazardModal = () => {
        setState((s) => ({ ...s, isHazardQrModelOpen: false }));
    }

    const handleOpenHazardQRModal = () => {
        setState((s) => ({ ...s, isHazardQrModelOpen: true }));
    };
    return {
        state,
        onClickCloseAddNew,
        onClickAddEdit,
        onPeoplePickerChange,
        onClickSaveDialog,
        onClickYesDelete,
        onCloseDeleteDialog,
        onClickDeleteButton,
        scrollTopRef,
        handleDownload,
        handleDownloadQR,
        oncloseHazardModal,
        handleOpenHazardQRModal
    }
}