import { WebPartContext } from "@microsoft/sp-webpart-base"
import { IDataProvider } from "../DataProvider/Interface/IDataProvider"
import { Layer, Popup, Overlay, FocusTrapZone, MessageBar, MessageBarType, DialogFooter, DefaultButton, mergeStyleSets, Link, TooltipHost, Checkbox, Toggle, } from '@fluentui/react';
import React from "react";
import { getExternalUrl, ListNames, QuaySafeSendEmailTypeEnum } from "./Enum/ComponentNameEnum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CamlBuilder from "camljs";
import { mapSingleValue } from "./Util";
import { DataType } from "./Constants/CommonConstants";
import { ICustomPeoplePicker, ILookup } from "../webparts/quayClean/components/CustomeComponents/WHSForms/IAddWHSMeetingFroms";
import { Loader } from "../webparts/quayClean/components/CommonComponents/Loader";
import NoRecordFound from "../webparts/quayClean/components/CommonComponents/NoRecordFound";
import { Label, PrimaryButton } from "office-ui-fabric-react";
import { faAnchorCircleExclamation, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";


export interface ISendEmailIMSProps {
    Data: any;
    isOpen: boolean;
    closePopup: any;
    Page: any;
    Context: WebPartContext;
    provider: IDataProvider;


}

export interface ISendEmailIMSState {
    isLoading: boolean;
    items: IItems[];
    renderItems: any[];
    renderSendItemsCount: number;
    selectedItems: any[];
    keyUpdate: number;
    isSendEmailAvailable: boolean;
    skillMatrixMasterData: any[];
    isInCompletentShow: boolean;
    isCompetencySelected: boolean;
    renderItemsCompetency: any[];
    renderItemsCompetencyCount: number;
    selectedItemsCompetency: any[];
    isCompetencyEmailAvailable: boolean;
    isItReadyToSendEmail: boolean;
    isItReadyToSendEmailCompetency: boolean;

}

interface IItems {
    ID: number;
    employeeId: number;

}

export const SendEmailIMS = (props: any) => {

    const [showResendMessage, setShowResendMessage] = React.useState(false);
    const [width, setWidth] = React.useState<string>("450px");
    const [state, setState] = React.useState<ISendEmailIMSState>({
        isLoading: false,
        items: [],
        renderItems: [],
        selectedItems: [],
        keyUpdate: Math.random(),
        isSendEmailAvailable: false,
        skillMatrixMasterData: [],
        isInCompletentShow: false,
        isCompetencySelected: false,
        renderItemsCompetency: [],
        isCompetencyEmailAvailable: false,
        selectedItemsCompetency: [],
        isItReadyToSendEmail: false,
        isItReadyToSendEmailCompetency: false,
        renderSendItemsCount: 0,
        renderItemsCompetencyCount: 0
    })

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
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 80px)',

            '@media (max-width: 1200px)': { // Medium screens
                maxHeight: 'calc(100vh - 40px)',
            },

            '@media (max-width: 768px)': { // Small screens
                maxHeight: 'calc(100vh - 10px)',
            }
        }
    });








    const handleSelectAll = (ev: any, checked: boolean) => {
        let renderItems = state.renderItems.map((i) => {
            return {
                ...i,
                isSelected: i.isEmailSend ? checked : false
            }

        });
        let selectedItems = renderItems.filter((i) => i.isSelected);
        setState((prevState: any) => ({ ...prevState, selectedItems: selectedItems, renderItems: renderItems, keyUpdate: Math.random() }));
    }

    const handleCheckboxChange = (checked?: boolean, index?: number) => {

        let items = state.renderItems;
        if (index != undefined && index > -1) {
            items[index] = {
                ...items[index],
                isSelected: checked
            }
        }

        let selectedItems = items.filter((i) => i.isSelected);
        setState((prevState: any) => ({ ...prevState, selectedItems: selectedItems, renderItems: items, keyUpdate: Math.random() }));

    }
    const handleCheckboxChangeCompetency = (checked?: boolean, index?: number) => {

        let items = state.renderItemsCompetency;
        if (index != undefined && index > -1) {
            items[index] = {
                ...items[index],
                isSelected: checked
            }
        }

        let selectedItems = items.filter((i) => i.isSelected);
        setState((prevState: any) => ({ ...prevState, selectedItemsCompetency: selectedItems, renderItemsCompetency: items, keyUpdate: Math.random() }));

    }

    const handleSelectCompetencyAll = (ev: any, checked: boolean) => {
        let renderItems = state.renderItemsCompetency.map((i) => {
            return {
                ...i,
                isSelected: i.isEmailSend ? checked : false
            }

        });
        let selectedItems = renderItems.filter((i) => i.isSelected);
        setState((prevState: any) => ({ ...prevState, selectedItemsCompetency: selectedItems, renderItemsCompetency: renderItems, keyUpdate: Math.random() }));
    }




    const onClickSendEmail = async () => {
        if (!!state.selectedItems && state.selectedItems.length > 0) {
            let allItems: any[] = []
            let EmailType: string = ""


            if (props.Page == "SkillMatrix") {
                if (!!props.Data.ID && props.Data.ID > 0) {
                    await props.provider.updateItem({ IntialEmail: false }, ListNames.SkillMatrix, props.Data.ID)
                    setShowResendMessage(true);
                    setTimeout(() => setShowResendMessage(false), 3000);
                }

            } else {
                switch (props.Page) {
                    case "ToolboxIncident":
                        EmailType = QuaySafeSendEmailTypeEnum.IncidentReport
                        break;
                    case "ToolboxTalk":
                        EmailType = QuaySafeSendEmailTypeEnum.ToolboxTalk
                        break;
                    case "WorkplaceInspectionChecklistReport":
                        EmailType = QuaySafeSendEmailTypeEnum.WorkplaceInspectionChecklistReport
                        break;
                    case "CorrectiveActionReport":
                        EmailType = QuaySafeSendEmailTypeEnum.CorrectiveActionReport
                        break;
                    case "SiteSafetyAudit":
                        EmailType = QuaySafeSendEmailTypeEnum.WHSCommitteeInspection
                        break;

                    default:
                        break;
                }
                for (let index = 0; index < state.selectedItems.length; index++) {
                    const element = state.selectedItems[index];
                    let obj = {
                        Title: !!element.Title ? element.Title : "",
                        SendToEmail: !!element.Email ? element.Email : "",
                        EmailType: EmailType,
                        ItemId: props.Data.ID,
                        EmployeeId: !!element.Id ? element.Id : 0,
                    }
                    allItems.push(obj);

                }
                let provider: IDataProvider = props.provider;
                setState((prevState) => ({ ...prevState, isLoading: true }))
                await provider.createItemInBatch(allItems, ListNames.SendEmailTempList)
                setShowResendMessage(true);
                setState((prevState) => ({ ...prevState, isLoading: false }));
                setTimeout(() => setShowResendMessage(false), 3000);
            }

        }
        // }
    }

    const onClickQuaySafeEmail = async (attendee: any) => {

        if (props.Page == "SkillMatrix") {
            if (!!props.Data.ID && props.Data.ID > 0) {
                await props.provider.updateItem({ IntialEmail: false }, ListNames.SkillMatrix, props.Data.ID)
                setShowResendMessage(true);
                setTimeout(() => setShowResendMessage(false), 3000);
            }

        } else {
            if (!!attendee && !!props.Data && props.Data.ID > 0) {
                let EmailType: string = ""
                switch (props.Page) {
                    case "ToolboxIncident":
                        EmailType = QuaySafeSendEmailTypeEnum.IncidentReport
                        break;
                    case "ToolboxTalk":
                        EmailType = QuaySafeSendEmailTypeEnum.ToolboxTalk
                        break;
                    case "WorkplaceInspectionChecklistReport":
                        EmailType = QuaySafeSendEmailTypeEnum.WorkplaceInspectionChecklistReport
                        break;
                    case "CorrectiveActionReport":
                        EmailType = QuaySafeSendEmailTypeEnum.CorrectiveActionReport
                        break;
                    case "SiteSafetyAudit":
                        EmailType = QuaySafeSendEmailTypeEnum.WHSCommitteeInspection
                        break;

                    default:
                        break;
                }
                let obj = {
                    Title: !!attendee.Title ? attendee.Title : "",
                    SendToEmail: !!attendee.Email ? attendee.Email : "",
                    EmailType: EmailType,
                    ItemId: props.Data.ID,
                    EmployeeId: !!attendee.Id ? attendee.Id : 0,
                }
                await props?.provider?.createItem(obj, ListNames.SendEmailTempList);
                setShowResendMessage(true);
                setTimeout(() => setShowResendMessage(false), 3000);
            }
        }
    }

    const onClickSendEmailCompetency = async () => {
        if (props.Page == "SkillMatrix") {
            if (!!props.Data.ID && props.Data.ID > 0) {
                await props.provider.updateItem({ CompetencyMail: true }, ListNames.SkillMatrix, props.Data.ID)
                setShowResendMessage(true);
                setTimeout(() => setShowResendMessage(false), 3000);
            }

        }
    }

    const onClickCompetencyToggle = (ev: any, checked: boolean) => {
        setState((prevState: any) => ({ ...prevState, isCompetencySelected: checked, keyUpdate: Math.random() }))
    }



    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

    React.useEffect(() => {
        (async () => {
            try {
                let items: IItems[] = [];
                let renderItems: any[] = [];
                let renderItemsCompetency: any[] = [];
                let ListName: string = "";
                let columnName: string = "";
                let anotherColumnName: string = "QuaycleanEmployee";

                let isReadyToSendEmail: boolean = false;
                let isItReadyToSendEmailCompetency: boolean = false;
                switch (props.Page) {
                    case "ToolboxIncident":
                        ListName = ListNames.ToolboxIncidentSignature;
                        columnName = "ToolboxIncident"
                        if (props.Data.IsActive == true && props.Data.FormStatus == "submit") {
                            isReadyToSendEmail = true;
                        }
                        break;
                    case "ToolboxTalk":
                        ListName = ListNames.ToolboxTalkSignature;
                        columnName = "ToolboxTalk"
                        if (props.Data.IsActive == true && props.Data.FormStatus == "submit") {
                            isReadyToSendEmail = true;
                        }
                        break;
                    case "WorkplaceInspectionChecklistReport":
                        ListName = ListNames.WorkplaceInspectionChecklistSignature;
                        columnName = "WorkplaceInspectionChecklist"
                        if (props.Data.IsActive == true && props.Data.FormStatus == "submit") {
                            isReadyToSendEmail = true;
                        }
                        break;
                    case "CorrectiveActionReport":
                        ListName = ListNames.CorrectiveActionReportSignature;
                        columnName = "CorrectiveActionReport"
                        if (props.Data.IsActive == true && props.Data.FormStatus == "submit") {
                            isReadyToSendEmail = true;
                        }
                        break;
                    case "SiteSafetyAudit":
                        ListName = ListNames.SiteSafetyAuditSignature;
                        columnName = "SiteSafetyAudit"
                        anotherColumnName = "WHSUsers"
                        if (props.Data.IsActive == true && props.Data.FormStatus == "submit") {
                            isReadyToSendEmail = true;
                        }
                        break;
                    case "SkillMatrix":
                        ListName = ListNames.SkillMatrixSignature;
                        columnName = "SkillMatrix"
                        if (props.Data.FormStatus == "Submitted") {
                            isReadyToSendEmail = true;
                        }
                        break;

                    default:
                        break;
                }
                setState((prevState) => ({ ...prevState, items: items, isLoading: true }));
                let Id = props?.Data?.ID
                let provider: IDataProvider = props.provider;
                if (!!Id && Id > 0) {
                    let camlQuery: any
                    if (props.Page == "SkillMatrix") {
                        camlQuery = new CamlBuilder().View(["ID", "Id", "Title", `${anotherColumnName}`, `${columnName}`, "CleanerSignature", "CleanerCompetencySignatureFull"])
                            .Scope(CamlBuilder.ViewScope.RecursiveAll)
                            .RowLimit(5000, true)
                            .Query()
                            .Where()
                            .LookupField(columnName).Id().EqualTo(Id)
                            .And().BooleanField("IsActive").EqualTo(true)
                            .ToString();
                    } else {
                        camlQuery = new CamlBuilder().View(["ID", "Id", "Title", `${anotherColumnName}`, `${columnName}`,])
                            .Scope(CamlBuilder.ViewScope.RecursiveAll)
                            .RowLimit(5000, true)
                            .Query()
                            .Where()
                            .LookupField(columnName).Id().EqualTo(Id)
                            .ToString();
                    }


                    const signItems = await provider.getItemsByCAMLQuery(ListName, camlQuery);
                    if (!!signItems && signItems) {
                        items = signItems.map((i) => {
                            return {
                                ID: mapSingleValue(i.ID, DataType.number),
                                employeeId: mapSingleValue(i[anotherColumnName], DataType.lookupId),
                                ...(props.Page === "SkillMatrix" && { CleanerSignature: mapSingleValue(i.CleanerSignature, DataType.YesNoTrue) }),
                                ...(props.Page === "SkillMatrix" && { CleanerCompetencySignatureFull: mapSingleValue(i.CleanerCompetencySignatureFull, DataType.string) })
                            }
                        })
                    }

                    let singCompetencyUserId: number[] = [];
                    let skillMatrixMasterData: any[] = []
                    if (props.Page == "SkillMatrix") {
                        let skillQuery: any;
                        skillQuery = new CamlBuilder().View(["ID", "Id", "Title", "IsInCompletent"])
                            .Scope(CamlBuilder.ViewScope.RecursiveAll)
                            .RowLimit(5000, true)
                            .Query()
                            .Where()
                            .LookupField("SkillMatrix").Id().EqualTo(Id)
                            .And().BooleanField("IsInCompletent").IsTrue()
                            .ToString();
                        const skillData = await provider.getItemsByCAMLQuery(ListNames.SkillMatrixMasterData, skillQuery);
                        if (!!skillData && skillData.length > 0) {
                            skillMatrixMasterData = skillData;
                            setState((prevState: any) => ({ ...prevState, isInCompletentShow: true }));

                            let data = items.filter((j: any) => !!j.CleanerCompetencySignatureFull);
                            singCompetencyUserId = data.map((r) => r.employeeId)


                        }
                    }
                    let singUserId: number[] = [];
                    if (!!items && items.length > 0) {
                        if (props.Page == "SkillMatrix") {
                            items = items.filter((i: any) => i.CleanerSignature == true);
                        }
                        singUserId = items.map((r) => r.employeeId)

                    }

                    if (!!props?.Data && !!props?.Data?.FullAttendeesArray && props.Data.FullAttendeesArray.length > 0) {
                        renderItemsCompetency = props.Data.FullAttendeesArray.map((i: any) => {
                            return {
                                ...i,
                                isEmailSend: singCompetencyUserId.indexOf(i.Id) == -1,
                                isSelected: false
                            }
                        })

                    }
                    if (!!props?.Data && !!props?.Data?.FullAttendeesArray && props.Data.FullAttendeesArray.length > 0) {
                        renderItems = props.Data.FullAttendeesArray.map((i: any) => {
                            return {
                                ...i,
                                isEmailSend: singUserId.indexOf(i.Id) == -1,
                                isSelected: false
                            }
                        })

                    }
                    let isCompetencyEmailAvailable: boolean = false;
                    let renderItemsCompetencyCount: number = 0
                    if (renderItemsCompetency.length > 0) {
                        if (props.Data.IsCompleted == true && props.Data.FormStatus == "Submitted") {
                            isItReadyToSendEmailCompetency = true
                        }
                        let data = renderItemsCompetency.filter((i: any) => i.isEmailSend);
                        renderItemsCompetencyCount = data?.length || 0
                        isCompetencyEmailAvailable = (!!data && data.length > 0) ? true : false
                    }

                    let isSendEmailAvailable: boolean = false;
                    let renderSendItemsCount: number = 0
                    if (renderItems.length > 0) {
                        let data = renderItems.filter((i: any) => i.isEmailSend);
                        renderSendItemsCount = data?.length || 0
                        isSendEmailAvailable = (!!data && data.length > 0) ? true : false
                    }


                    setState((prevState) => ({
                        ...prevState, items: items,
                        isItReadyToSendEmailCompetency: isItReadyToSendEmailCompetency,
                        isCompetencyEmailAvailable: isCompetencyEmailAvailable,
                        renderItemsCompetency: renderItemsCompetency,
                        renderItemsCompetencyCount: renderItemsCompetencyCount,
                        isLoading: false,
                        renderItems: renderItems,
                        renderSendItemsCount: renderSendItemsCount,
                        isSendEmailAvailable: isSendEmailAvailable,
                        isItReadyToSendEmail: isReadyToSendEmail
                    }));
                }
            } catch (error) {
                console.log(`useEffect Send Email ${props.Page}` + error);

            }
        })()

    }, [props.Data])

    return (props.isOpen && (
        <Layer>
            {state.isLoading && <Loader />}
            <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={props.closePopup}>
                <Overlay onClick={props.closePopup} />
                <FocusTrapZone>
                    <Popup role="document" className={popupStyles.content}>
                        <div className="ss-per-pad">
                            <div className="dflex justifyContentBetween" style={{ alignItems: "baseline" }} >
                                <h2 className="mt-10">Send Email </h2>
                                <div className="dflex">

                                    {(props.Page == "SkillMatrix" && state.isInCompletentShow == true) && <div className="dflex" style={{ alignItems: "baseline" }} >
                                        <Label>Is Competency</Label>
                                        <Toggle className="ml5" onChange={onClickCompetencyToggle} checked={state.isCompetencySelected} />
                                    </div>}
                                    <Link className="actionBtn btnView dticon ml-10 " >
                                        <TooltipHost content={(state.isCompetencySelected ? (state.isItReadyToSendEmailCompetency ? "Select checkbox to send email" : " Cleaner has not completed the training yet") : (state.isItReadyToSendEmail ? "Select checkbox to send email" : "No email in Draft status."))} >
                                            <FontAwesomeIcon icon={"exclamation-circle"} />
                                        </TooltipHost>
                                    </Link>

                                </div>
                            </div>
                            <div className="mt-2">
                                {showResendMessage && (
                                    <MessageBar messageBarType={MessageBarType.success}>
                                        <div className="inputText">Email resend successfully!</div>
                                    </MessageBar>
                                )}
                            </div>
                            {!!props.Data && props.Data?.FullAttendeesArray?.length > 0 && (
                                <table className="custom-table-ans" key={state.keyUpdate}>
                                    <thead>
                                        <tr>

                                            <th className="custom-header-ans-link" style={{ width: "90%" }}><b>Attendees Name</b></th>
                                            <th className="custom-header-ans" >
                                                {(state.isCompetencySelected) ?
                                                    (((state.isCompetencyEmailAvailable) && (state.renderItemsCompetency.length > 0 && (state.isItReadyToSendEmailCompetency == true))) ? <Checkbox
                                                        onChange={handleSelectCompetencyAll}
                                                        checked={state.renderItemsCompetencyCount === state.selectedItemsCompetency.length}
                                                    /> : <>&nbsp;</>)
                                                    : (((state.isItReadyToSendEmail == true) && (state.isSendEmailAvailable && state.renderItems.length > 0)) ?
                                                        <Checkbox
                                                            onChange={handleSelectAll}
                                                            checked={state.renderSendItemsCount === state.selectedItems.length}
                                                        /> : <>&nbsp;</>)
                                                }
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody key={state.keyUpdate}>
                                        {(state.isInCompletentShow && state.isCompetencySelected) ?
                                            (state.renderItemsCompetency.length > 0 ? state.renderItemsCompetency.map((attendee: any, index: number) => {
                                                return (
                                                    <tr key={attendee.Id}>

                                                        <td className="custom-cell-ans alignLeft">
                                                            <h4>{attendee.Title} </h4>
                                                        </td>
                                                        <td className="custom-cell-ans alignLeft" onClick={(e) => e.stopPropagation()}>
                                                            {((state.isItReadyToSendEmailCompetency == true) && (attendee.isEmailSend)) ? <Checkbox
                                                                onChange={(e, check) => handleCheckboxChangeCompetency(check, index)}
                                                                checked={attendee?.isSelected}
                                                            /> : (attendee.isEmailSend == false) ? <div className="fPrimary">
                                                                <TooltipHost content={"Signature Done "}>
                                                                    <FontAwesomeIcon icon={"marker"} />
                                                                </TooltipHost>
                                                            </div> : <>&nbsp;</>}
                                                        </td>
                                                    </tr>
                                                );
                                            }) :
                                                <tr>
                                                    <td colSpan={3}> <NoRecordFound /></td>
                                                </tr>)

                                            : (state.renderItems.length > 0 ? state.renderItems.map((attendee: any, index: number) => {
                                                return (
                                                    <tr key={attendee.Id}>

                                                        <td className="custom-cell-ans alignLeft ">
                                                            <h4>{attendee.Title} </h4>

                                                        </td>
                                                        <td className="custom-cell-ans alignLeft" onClick={(e) => e.stopPropagation()}>
                                                            {((state.isItReadyToSendEmail == true) && attendee.isEmailSend) ? <Checkbox
                                                                onChange={(e, check) => handleCheckboxChange(check, index)}
                                                                checked={attendee?.isSelected}
                                                            /> : <>    {(attendee.isEmailSend == false) ? <div className="fPrimary">
                                                                <TooltipHost content={"Signature Done "}>
                                                                    <FontAwesomeIcon icon={"marker"} />
                                                                </TooltipHost>
                                                            </div> : <>&nbsp;</>}   </>}
                                                        </td>
                                                    </tr>
                                                );
                                            }) :
                                                <tr>
                                                    <td colSpan={3}> <NoRecordFound /></td>
                                                </tr>)
                                        }
                                    </tbody>
                                </table>
                            )}

                        </div>
                        <DialogFooter>
                            {(state.isCompetencySelected && state.isInCompletentShow) ?
                                <PrimaryButton
                                    // className="btn-primary"
                                    // className={(state.isSendEmailAvailable && (state.selectedItems.length > 0)) ? "btn-primary" : ""}
                                    className={((state.isCompetencyEmailAvailable == false) || (state.selectedItemsCompetency.length == 0) || (state.isItReadyToSendEmailCompetency == false)) ? "" : "btn-primary"}
                                    disabled={((state.isCompetencyEmailAvailable == false) || (state.selectedItemsCompetency.length == 0) || (state.isItReadyToSendEmailCompetency == false))}
                                    // disabled={true}
                                    onClick={onClickSendEmailCompetency}
                                    text="Send Email"
                                />

                                : <PrimaryButton
                                    // className="btn-primary"
                                    // className={(state.isSendEmailAvailable && (state.selectedItems.length > 0)) ? "btn-primary" : ""}
                                    className={((state.isSendEmailAvailable == false) || (state.selectedItems.length == 0) || (state.isItReadyToSendEmail == false)) ? "" : "btn-primary"}
                                    disabled={((state.isSendEmailAvailable == false) || (state.selectedItems.length == 0) || (state.isItReadyToSendEmail == false))}
                                    // disabled={true}
                                    onClick={onClickSendEmail}
                                    text="Send Email"
                                />

                            }
                            <DefaultButton
                                text="Close"
                                className="secondMain btn btn-danger mr-16 ss-per-mr"
                                onClick={props.closePopup}
                            />
                        </DialogFooter>
                    </Popup>
                </FocusTrapZone>
            </Popup >
        </Layer >
    ))

}