/* eslint-disable react/jsx-key */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider"; import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { _onItemSelected, getConvertedDate, isLink, isWithinNextMonthRange, logGenerator, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { Breadcrumb, IDropdownOption, Link, MessageBar, MessageBarType, Panel, PanelType, Pivot, PivotItem, PrimaryButton, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "@fluentui/react-hooks";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { MicrosoftOfficeDocumentType, OptionColorType } from "../../../../../Common/Constants/CommonConstants";
import { Loader } from "../../CommonComponents/Loader";
import moment from "moment";
import { useRef } from "react";
import { ICheckListDetail, ICheckListMasterDetail } from "../../../../../Interfaces/ICheckListDetail";
import CheckListInfo from "./CheckListInfo";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
// import { IFramePanel } from "@pnp/spfx-controls-react/lib/IFramePanel";
export interface DailyOperatorChecklistProps {
    provider: IDataProvider;
    context: WebPartContext;
    manageComponentView(componentProp: IQuayCleanState): any;
    currentCompomentName?: string;
    siteName?: string;
    siteMasterId?: number;
    preViousCompomentName?: string;
    breadCrumItems: any[];
    qCState?: string;
    MasterId?: any;
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    checkListObj?: ICheckListDetail;
}

export const DailyOperatorChecklist = (props: DailyOperatorChecklistProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [ListData, setListData] = React.useState<any>([]);
    const [checklistDetail, setChecklistDetail] = React.useState<any>();
    const [selectedKey, setselectedKey] = React.useState<any>("PreChecklist");
    const tooltipId = useId('tooltip');

    const _onLinkClick = (item: PivotItem): void => {
        setselectedKey(item.props.itemKey);
    };

    const _getChecklistResponseDetailsData = async (ChecklistResponseId: number) => {
        setIsLoading(true);

        const select = ["ID", "ChecklistResponseId", "QuestionMasterId", "QuestionText", "ChecklistResponse/Title", "QuestionMaster/Title", "QuestionMaster/Index", "Answer", "Attachments", "AttachmentFiles"];
        const expand = ["ChecklistResponse", "QuestionMaster", "AttachmentFiles"];
        const filter = `ChecklistResponseId eq ${ChecklistResponseId}`;
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            listName: ListNames.ChecklistResponseDetails,
            filter: filter
        };

        try {
            const results = await props.provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {

                const listData = results.map((data) => ({
                    ID: data.ID,
                    ChecklistResponseId: data.ChecklistResponseId ?? '',
                    QuestionMasterId: data.QuestionMasterId ?? '',
                    // Question: data.QuestionMaster?.Title ?? '',
                    // Question: data.QuestionText ?? '', 
                    Question: data?.QuestionText ?? data?.QuestionMaster?.Title ?? '',
                    Answer: data.Answer ?? '',
                    Attachments: data.Attachments ?? false,
                    AttachmentFiles: data.AttachmentFiles ?? undefined,
                    Index: data.QuestionMaster?.Index ?? 0,

                }));
                const sorted = listData.map((item: any) => ({
                    ...item,
                    Index: item?.Index === "" ? Infinity : Number(item?.Index)
                })).sort((a, b) => a.Index - b.Index);

                return sorted;
            }
            return [];
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const _getChecklistResponseMasterDetail = async (Id: number) => {
        if (!!Id) {
            const selectItem = ["ID,SiteNameId,SiteName/Title,AssetMasterId,AssetMaster/Title,ConductedOn,OperatorName,ChecklistType,IsAssetDamaged,AssociatedTeamId,Signature,ConductedOnNote,SignatureNote,OperatorNameNote,DateNote,Attachments, AttachmentFiles"];
            //const expandItem = ["SiteName, AssetMaster"];
            const expandItem = ["SiteName", "AssetMaster", "AttachmentFiles"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.ChecklistResponseMaster,
                select: selectItem,
                expand: expandItem,
                filter: filter,
                id: Id
            };
            return await props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    const _getOptionColorMasterList = async () => {
        setIsLoading(true);
        const select = ["ID", "Title", "ColorNumber", "OptionType"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.OptionColorMaster,
            filter: ""
        };

        try {
            const results = await props.provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Title: data.Title ?? '',
                    ColorNumber: data.ColorNumber ?? '',
                    OptionType: data.OptionType ?? '',
                }));
                return listData;
            }
            return [];
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        void (async () => {
            setIsLoading(true);
            const checklistId = (selectedKey == "PreChecklist") ? (props.checkListObj?.PreId || 0) : (props.checkListObj?.PostId || 0);
            if (checklistId > 0) {
                const objItem = await _getChecklistResponseMasterDetail(checklistId);
                const qaList = await _getChecklistResponseDetailsData(checklistId);
                const colorList = await _getOptionColorMasterList();
                const items: any = {
                    ID: objItem.ID,
                    SiteNameId: !!objItem.SiteNameId ? objItem.SiteNameId : "",
                    AssetMasterId: !!objItem.AssetMasterId ? objItem.AssetMasterId : "",
                    AssociatedTeamId: !!objItem.AssociatedTeamId ? objItem.AssociatedTeamId : "",
                    OperatorName: !!objItem.OperatorName ? objItem.OperatorName : "",
                    // ConductedOn: !!objItem.ConductedOn ? getConvertedDate(objItem.ConductedOn) : "",
                    ConductedOn: !!objItem.ConductedOn ? objItem.ConductedOn : "",
                    ConductedOnOrg: !!objItem.ConductedOn ? objItem.ConductedOn : "",
                    ChecklistType: !!objItem.ChecklistType ? objItem.ChecklistType : "",
                    IsAssetDamaged: !!objItem.IsAssetDamaged ? "Yes" : "No",
                    SiteName: objItem?.SiteName?.Title || "",
                    AssetName: objItem?.AssetMaster?.Title || "",
                    Signature: objItem?.Signature,
                    Attachments: objItem.Attachments ?? false,
                    AttachmentFiles: objItem.AttachmentFiles ?? undefined,
                };

                const totalQuestions = qaList?.length || 0;

                let totalPositive = 0;
                let totalNegative = 0;

                if (qaList?.length) {
                    qaList.forEach((question) => {
                        const clrDetail = colorList?.find(x => x.Title === question.Answer);
                        if (clrDetail) {
                            if (clrDetail.OptionType === OptionColorType.Positive) {
                                totalPositive++;
                            } else if (clrDetail.OptionType === OptionColorType.Negative) {
                                totalNegative++;
                            }
                        }
                    });
                }

                //const totalPercent = totalPositive > 0 ? (totalQuestions * 100) / totalPositive : 0;
                //const totalPercent = totalQuestions > 0 ? (totalPositive * 100) / totalQuestions : 0;
                const totalPercent = totalQuestions > 0 ? ((totalPositive * 100) / totalQuestions).toFixed(2) : "0.00";

                const checklistInfo: ICheckListMasterDetail = {
                    ID: items?.ID,
                    SiteNameId: items?.SiteNameId,
                    AssetMasterId: items?.AssetMasterId,
                    operatorName: items?.OperatorName,
                    title: items?.SiteName,
                    // date: items?.ConductedOn,
                    date: moment(items?.ConductedOn).format("DD MMM YYYY"),
                    location: items?.AssetName,
                    inspectionScores: [],
                    siteConducted: items?.SiteName,
                    conductedOn: moment(items?.ConductedOn).format("DD MMM YYYY h:mm A [GMT] Z"),
                    conductedTime: items?.ConductedOn,
                    checklistType: items?.ChecklistType,
                    signature: items?.Signature,
                    questionAnswerList: qaList,
                    totalQuestions: totalQuestions,
                    totalPositiveQuestions: totalPositive,
                    totalNegativeQuestions: totalNegative,
                    totalPercentage: totalPercent,
                    Attachments: items.Attachments ?? false,
                    AttachmentFiles: items.AttachmentFiles ?? undefined,
                };
                //setChecklistDetail(items);
                setChecklistDetail(checklistInfo);
                setIsLoading(false);

            } else {
                setChecklistDetail(undefined);
                setIsLoading(false);
            }
        })();
    }, [props.checkListObj, selectedKey]);

    return <>
        {isLoading && <Loader />}

        <div className="boxCard bgGrey">
            <main>
                <section className="">
                    <div className="container w-850" >

                        <div className="row justCenter">
                            <div className="col-lg-10 mb-3 bgWhite" id="pdfGenerate1">
                                <Pivot aria-label="Basic Pivot Example" id="mainpivot" selectedKey={selectedKey}
                                    onLinkClick={_onLinkClick}>

                                    <PivotItem headerText="Pre Checklist" itemKey="PreChecklist">
                                        <div className='mt-3'>
                                            {/* <div><h2 className="mainTitle mb-3">Pre Checklist</h2></div> */}
                                            {checklistDetail?.questionAnswerList?.length > 0 ? (
                                                <CheckListInfo data={checklistDetail} />
                                            ) : (
                                                <NoRecordFound />
                                            )}

                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="Post Checklist" itemKey="PostChecklist">
                                        <div className='mt-3'>
                                            {/* <div><h2 className="mainTitle mb-3">Post Checklist</h2></div> */}
                                            {checklistDetail?.questionAnswerList?.length > 0 ? (
                                                <CheckListInfo data={checklistDetail} />
                                            ) : (
                                                <NoRecordFound />
                                            )}
                                        </div>
                                    </PivotItem>
                                </Pivot>

                            </div>
                        </div>

                        <div className="row mb-3 justCenter">
                            <div className="col-lg-10 mb-3 p-0 textRight">
                                <PrimaryButton className="btn btn-danger justifyright floatright mb-3 m-0" text="Back"
                                    onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        props.manageComponentView({
                                            currentComponentName: !!props.preViousCompomentName ? props.preViousCompomentName : ComponentNameEnum.AssetDetails,
                                            //preViousComponentName: ComponentNameEnum.AssetList,
                                            MasterId: checklistDetail?.SiteNameId || props?.checkListObj?.SiteNameId,
                                            dataObj: props.componentProp.dataObj,
                                            breadCrumItems: breadCrumItems,
                                            IsSupervisor: props.componentProp.IsSupervisor,
                                            siteMasterId: checklistDetail?.AssetMasterId || props?.checkListObj?.AssetMasterId,
                                            isShowDetailOnly: true,
                                            siteName: props.componentProp.siteName,
                                            qCState: props.componentProp.qCState,
                                            pivotName: "AssetDailyUsageReport"
                                        });
                                    }} />
                            </div>
                        </div>
                    </div>

                </section >
            </main >
            <footer className="footer mt-auto">
                <div className="">
                    <span>Copyright Quayclean © 2023</span>
                </div>
            </footer>
        </div >
    </>;

};

