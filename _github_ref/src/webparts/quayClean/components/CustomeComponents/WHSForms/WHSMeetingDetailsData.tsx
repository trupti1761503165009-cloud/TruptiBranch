/* eslint-disable*/
import { useAtomValue } from "jotai";

import React from "react";
import { IAddWHSCommitteeMeetingMaster, IAddWHSCommitteeMeetingDetail, IWHSCommitteeMeetingMaster, IWHSCommitteeMeetingDetail, IWHSUsers } from "./IAddWHSMeetingFroms";
import CamlBuilder from "camljs";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { generateAndSaveKendoPDF, mapSingleValue, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { DataType, DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import { IWHSMeetingDetailProps } from "./WHSMeetingDetail";
import { useBoolean } from "@uifabric/react-hooks";
import { toastService } from "../../../../../Common/ToastService";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import moment from "moment";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
const imgLogo = require('../../../assets/images/logo.png');
export interface IWHSMeetingDetailsDataState {
    isLoading: boolean;
    whsCommitteeMeetingMasterItem: IWHSCommitteeMeetingMaster;
    whsCommitteeMeetingDetailItemKeyItems: IWHSCommitteeMeetingDetail[];
    whsCommitteeMeetingDetailItemActionItemsNotCompleted: IWHSCommitteeMeetingDetail[];
    whsCommitteeMeetingDetailItemActionCompleted: IWHSCommitteeMeetingDetail[];
    whsUserData: IWHSUsers[]
    isPrint: boolean;
    imageBase64: string;

}

export const WHSMeetingDetailsData = (props: IWHSMeetingDetailProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [AllSignatureData, seAllSignatureData] = React.useState<any>();
    const [state, setState] = React.useState<IWHSMeetingDetailsDataState>({
        isLoading: false,
        imageBase64: "",
        whsCommitteeMeetingMasterItem: {
            MinutesCirculatedTo: [],
            MeetingDate: undefined,
            Apologies: [],
            Attendees: [],
            Other: "",
            EndTime: "",
            StartTime: "",
            Location: "",
            Title: "",
            Id: 0
        },
        whsUserData: [],
        isPrint: false,
        whsCommitteeMeetingDetailItemActionCompleted: [],
        whsCommitteeMeetingDetailItemActionItemsNotCompleted: [],
        whsCommitteeMeetingDetailItemKeyItems: []
    })

    const getItemsWHSMaster = async () => {
        let items: IWHSCommitteeMeetingMaster[] = [];
        const camlQuery = new CamlBuilder()
            .View(["MinutesCirculatedTo", "MeetingDate", "Apologies", "Attendees", "Other", "EndTime", "StartTime", "Location", "ID", "Title"])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query()
            .Where()
            .NumberField("ID").EqualTo(props.whsMasterId)
            .ToString()
        let data = await provider.getItemsByCAMLQuery(ListNames.WHSCommitteeMeetingMaster, camlQuery)
        if (!!data && data.length > 0) {
            items = data.map((i: any) => {
                return {
                    MinutesCirculatedTo: mapSingleValue(i.MinutesCirculatedTo, DataType.ChoiceMultiple),
                    MeetingDate: mapSingleValue(i.MeetingDate, DataType.Date),
                    MeetingDatePrint: mapSingleValue(i.MeetingDate, DataType.DateDDMMYYY),
                    Apologies: mapSingleValue(i.Apologies, DataType.lookupMuilt),
                    Attendees: mapSingleValue(i.Attendees, DataType.lookupMuilt),
                    Other: mapSingleValue(i.Other, DataType.string),
                    EndTime: mapSingleValue(i.EndTime, DataType.string),
                    StartTime: mapSingleValue(i.StartTime, DataType.string),
                    Location: mapSingleValue(i.Location, DataType.string),
                    Title: mapSingleValue(i.Title, DataType.string),
                    Id: mapSingleValue(i.ID, DataType.number),
                    ID: mapSingleValue(i.ID, DataType.number),
                    AttendeesArray: i.Attendees?.map((attendee: { lookupId: number; lookupValue: string }) => attendee.lookupValue) || []
                }
            })
        }
        SignatureData(items[0]?.AttendeesArray);
        return items;
    }

    const SignatureData = (WHSUsers: any) => {
        try {
            const select = ["ID,Title,Signature,WHSMasterId,WHSMaster/Title,WHSUsersId,WHSUsers/UserName,Created"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["WHSMaster,WHSUsers"],
                filter: `WHSMasterId eq '${props.whsMasterId}'`,
                listName: ListNames.WHSSignature,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SignatureListData = WHSUsers.map((user: any) => {
                        // Find matching record in results
                        const matchedData = results.find((data) => data.WHSUsers?.UserName === user);
                        if (matchedData) {
                            return {
                                ID: matchedData.ID,
                                Title: matchedData.Title,
                                Signature: matchedData.Signature || '',
                                Created: matchedData.Created ? moment(matchedData.Created).format(DateTimeFormate) : '',
                                WHSUsersId: matchedData.WHSUsersId || 0,
                                WHSUsers: matchedData.WHSUsers?.UserName || '',
                            };
                        } else {
                            return {
                                ID: '',
                                Title: '',
                                Signature: '',
                                Created: '',
                                WHSUsersId: 0,
                                WHSUsers: user, // Use the missing user's name
                            };
                        }
                    });
                    seAllSignatureData(SignatureListData);
                }
            }).catch((error: any) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
        }
    };


    const getWHSUserData = async () => {
        try {
            let whsUserData: IWHSUsers[] = [];
            const camlQuery = new CamlBuilder()
                .View(["State", "User", "Email", "UserRole", "ShortForm", "UserName", "ID", "Title"])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
                .ToString()
            let data = await provider.getItemsByCAMLQuery(ListNames.WHSUsers, camlQuery);
            if (!!data && data.length > 0) {
                whsUserData = data.map((r: any) => {
                    return {
                        StateId: mapSingleValue(r.State, DataType.lookupMuilt),
                        UserId: mapSingleValue(r.User, DataType.peoplePicker),
                        User: mapSingleValue(r.User, DataType.string),
                        Email: mapSingleValue(r.Email, DataType.string),
                        UserRole: mapSingleValue(r.UserRole, DataType.string),
                        ShortForm: mapSingleValue(r.ShortForm, DataType.string),
                        UserName: mapSingleValue(r.UserName, DataType.string),
                        Title: mapSingleValue(r.Title, DataType.string),
                        Id: mapSingleValue(r.ID, DataType.number),
                    }
                })
            }
            return whsUserData
        } catch (error) {
            let errorLogObj: any = {
                ErrorMessage: "",
                Title: "AddWHSFormData",
                PageName: "QuaysafeDashboard.aspx",
                ErrorMethodName: "getWHSUserData",
                FileName: "AddWHSFormData",
                Error: `${error}`
            }
            console.log(errorLogObj);
        }
    }

    const getWHSDetails = async () => {
        let items: IWHSCommitteeMeetingDetail[] = [];
        const camlQuery = new CamlBuilder()
            .View(["DueCompletedDate", "WHSCommitteeMeetingMaster", "WHO", "Description", "Item", "ItemNo", "IsCompleted", "ID", "Title"])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query()
            .Where()
            .LookupField("WHSCommitteeMeetingMaster").Id().EqualTo(props.whsMasterId)
            .ToString()
        let data = await provider.getItemsByCAMLQuery(ListNames.WHSCommitteeMeetingDetail, camlQuery);
        if (!!data && data.length > 0) {
            items = data.map((i: any) => {
                return {
                    DueCompletedDate: mapSingleValue(i.DueCompletedDate, DataType.Date),
                    WHSCommitteeMeetingMaster: mapSingleValue(i.WHSCommitteeMeetingMaster, DataType.lookup),
                    WHO: mapSingleValue(i.WHO, DataType.lookupMuilt),
                    Description: mapSingleValue(i.Description, DataType.string),
                    Item: mapSingleValue(i.Item, DataType.string),
                    ItemNo: mapSingleValue(i.ItemNo, DataType.string),
                    IsCompleted: mapSingleValue(i.IsCompleted, DataType.YesNoTrue),
                    Title: mapSingleValue(i.Title, DataType.string),
                }
            })
        }
        return items;

    }

    const onclickSendEmail = () => {
        showPopup();
    };
    const onClickCancelEmail = (): void => {
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

    const onClickCancel = (): void => {
        resetForm();
        hidePopup();
    };

    const onClickSendEmail = async (): Promise<void> => {
        setState((prevState) => ({ ...prevState, isLoading: true }));
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            // const fileName = `WHS-Committee Meeting Minutes ${(state.whsCommitteeMeetingMasterItem as any).MeetingDatePrint}.pdf`;
            const fileName = !props.isWHSMeetingAgenda ? `WHS-Committee Meeting Minutes ${(state.whsCommitteeMeetingMasterItem as any).MeetingDatePrint}.pdf` : `WHS-Committee Meeting Agenda ${(state.whsCommitteeMeetingMasterItem as any).MeetingDatePrint}.pdf`;
            let fileblob: any = await generateAndSaveKendoPDF("whsCommitteeMeetingPrint", fileName, false,);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                // StateName: SiteData[0]?.QCState,
                // SiteName: SiteData[0]?.Title,
                StateName: "",
                SiteName: "",
                // EmailType: "WHS Committee Meeting"
                EmailType: !props.isWHSMeetingAgenda ? "WHS Committee Meeting" : "WHS Committee Meeting Agenda"
            };
            provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.componentProps?.originalSiteMasterId || props?.componentProps?.UpdateItem?.SiteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.WHSCommitteeMeeting,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email WHS Committee Meeting  to ${sendToEmail}`
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }).catch((err: any) => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickCancel();
                setState((prevState) => ({ ...prevState, isLoading: false }));
            }).catch((err: any) => console.log(err));
        } else {
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }
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

    const onClickClose = () => {
        // if (props?.componentProps?.originalSiteMasterId) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: ComponentNameEnum.AddNewSite, originalState: "StateName", view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "WHSCommitteeMeeting"
        //     });

        // } else {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "WHSCommitteeMeeting" });
        // }
        if (props.isForm) {
            window.open('');
        } else {
            if (isSiteLevelComponent) {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: !props.isWHSMeetingAgenda ? "WHSCommitteeMeeting" : "WHSCommitteeAgenda"
                });
            } else {
                if (props.isDirectView) {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    props.manageComponentView({
                        currentComponentName: !props.isWHSMeetingAgenda ? ComponentNameEnum.WHSCommitteeMeeting : ComponentNameEnum.WHSMeetingAgendaGrid, qCStateId: props?.componentProps?.qCStateId, originalState: props.componentProps.originalState, dataObj: props.componentProps.dataObj, breadCrumItems: props.componentProps.breadCrumItems, siteMasterId: props.componentProps.siteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.originalState, pivotName: "IMSKey", subpivotName: !props.isWHSMeetingAgenda ? "WHSCommitteeMeeting" : "WHSCommitteeAgenda",
                    });
                } else {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: !props.isWHSMeetingAgenda ? "WHSCommitteeMeeting" : "WHSCommitteeAgenda", selectedZoneDetails: props.componentProps.selectedZoneDetails });
                }

            }

        }
    };



    const onClickDownload = async (): Promise<void> => {
        setState((prevState) => ({ ...prevState, isLoading: true, isPrint: true }))
        // const fileName = `WHS-Committee Meeting Minutes ${state.whsCommitteeMeetingMasterItem.MeetingDate}`;
        // const fileName = `WHS Committee MOM 21-06-2002`;
        // const fileName = `WHS-Committee Meeting Minutes ${(state.whsCommitteeMeetingMasterItem as any).MeetingDatePrint}`;
        const fileName = !props.isWHSMeetingAgenda ? `WHS-Committee Meeting Minutes ${(state.whsCommitteeMeetingMasterItem as any).MeetingDatePrint}` : `WHS-Committee Meeting Agenda ${(state.whsCommitteeMeetingMasterItem as any).MeetingDatePrint}`;
        let fileblob: any = await generateAndSaveKendoPDF("whsCommitteeMeetingPrint", fileName, false, true);
        setState((prevState) => ({ ...prevState, isLoading: false, isPrint: false }))
    };

    const getImageBase = async () => {
        const response = await fetch(imgLogo);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    React.useEffect(() => {
        (async () => {
            try {

                if (!!props.whsMasterId && props.whsMasterId > 0) {
                    setState((prevState: any) => ({ ...prevState, isLoading: true }));
                    const [whsMasterItems, whsDetailsData, whsUserData, imageBase64] = await Promise.all([getItemsWHSMaster(), getWHSDetails(), getWHSUserData(), getImageBase()]);

                    if (whsMasterItems.length > 0) {
                        let activeItemsCompleted: IWHSCommitteeMeetingDetail[] = [];
                        let activeItemsNotCompleted: IWHSCommitteeMeetingDetail[] = [];
                        let activeItemsKeyItems: IWHSCommitteeMeetingDetail[] = [];
                        if (whsDetailsData.length > 0) {
                            activeItemsCompleted = whsDetailsData.filter((i) => i.IsCompleted && (i.Item == "" || i.Item == undefined || i.Item == null));
                            activeItemsNotCompleted = whsDetailsData.filter((i) => i.IsCompleted == false && (i.Item == "" || i.Item == undefined || i.Item == null));
                            activeItemsKeyItems = whsDetailsData.filter((i) => i.Item);
                        }
                        setState((prevState: any) => ({
                            ...prevState,
                            imageBase64: imageBase64,
                            isLoading: false, whsCommitteeMeetingMasterItem: whsMasterItems[0],
                            whsUserData: whsUserData,
                            whsCommitteeMeetingDetailItemActionCompleted: activeItemsCompleted,
                            whsCommitteeMeetingDetailItemActionItemsNotCompleted: activeItemsNotCompleted,
                            whsCommitteeMeetingDetailItemKeyItems: activeItemsKeyItems
                        }));
                    }
                }


            } catch (error) {
                let errorLogObj: any = {
                    ErrorMessage: "",
                    Title: "WHSDetailsData",
                    PageName: "QuaysafeDashboard.aspx",
                    ErrorMethodName: "useEffect",
                    FileName: "WHSDetailsData",
                    Error: `${error}`
                }
                console.log(errorLogObj);
            }
        })()

    }, []);

    return {
        state,
        onClickDownload,
        hidePopup,
        isPopupVisible,
        title,
        sendToEmail,
        onChangeTitle,
        onChangeSendToEmail,
        displayerrortitle,
        displayerroremail,
        displayerror,
        onClickSendEmail,
        onClickCancel,
        onclickSendEmail,
        onClickClose,
        AllSignatureData
    }

}