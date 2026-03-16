import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, Panel, PanelType, PrimaryButton, TooltipHost } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ChemicalItem } from "../../../../../Interfaces/IAddNewChemical";
import moment from "moment";
import { AssociatedChemicalMaster } from "./AssociatedChemicalMaster";
import { Loader } from "../../CommonComponents/Loader";
import { logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { useId } from "@fluentui/react-hooks";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { DateFormat, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { _getDocumentData } from "../../CommonComponents/CommonMethods";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IAddNewProjectProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewProject?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    isAssetDetails?: boolean;
    isShowDetailOnly?: boolean;
    preViousCompomentName?: string;
    siteName?: string;
    qCState?: string;
    MasterId?: any;
    componentProp: IQuayCleanState;
    IsSupervisor?: boolean;
}

export const ViewChemicalDetail = (props: IAddNewProjectProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const { manageComponentView, siteMasterId, context } = props;
    const [chemicalDetail, setChemicalDetail] = React.useState<ChemicalItem>();
    const tooltipId = useId('tooltip');
    const isCall = React.useRef<boolean>(true);
    const [selectedSDSUrl, setSelectedSDSUrl] = React.useState<string | null>(null);

    const onClickClose = () => {
        if (props.componentProp.IsMasterChemical === true) {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.ChemicalMaster, view: props?.componentProp?.view, breadCrumItems: breadCrumItems });
        } else {
            if (!isSiteLevelComponent) {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                manageComponentView({ currentComponentName: ComponentNameEnum.AssociateChemical, view: props?.componentProp?.view, breadCrumItems: breadCrumItems });
            } else {
                    props.manageComponentView({
                        currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                        selectedZoneDetails: selectedZoneDetails,
                        isShowDetailOnly: true,
                        pivotName: "ChemicalKey",
                    });
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // props.manageComponentView({
                //     currentComponentName: !!props.preViousCompomentName ? props.preViousCompomentName : ComponentNameEnum.AddNewSite, view: props?.componentProp?.view, dataObj: props.componentProp.dataObj, breadCrumItems: breadCrumItems, IsSupervisor: props.componentProp.IsSupervisor, siteMasterId: props.componentProp.MasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ChemicalKey"
                // });
            }
        }
    };

    const [showModal, setShowModal] = React.useState(false);
    const openModal = () => { setShowModal(true); };
    const closeModal = () => { setShowModal(false); };

    const getChemicalDetailByID = (ChemicalId: number) => {
        if (!!ChemicalId) {
            const selectItem = ["ID,Title,Manufacturer,ProductPhotoThumbnailUrl,SDSDate,Hazardous,HazClass,StorageRequest,pH,StorageClass,SDS,PPERequired,QCNotes,NumberOfItems,ExpirationDate,SDSDocument,ProductPhoto,IsSDSDocument"];
            const filter = `ID eq ${ChemicalId}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.ChemicalRegistration,
                select: selectItem,
                filter: filter,
                id: ChemicalId
            };
            return props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    // const getFileName = (filePath?: string) => {
    //     const pathComponents = filePath?.split(/[\\/]/);
    //     const fileName = pathComponents?.pop();
    //     return fileName;
    // };

    const getFileName = (filePath?: string) => {
        const pathComponents = filePath?.split(/[\\/]/);
        const fileName = pathComponents?.pop();
        return fileName;
    };

    React.useEffect(() => {
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                if (siteMasterId && siteMasterId > 0) {
                    const chemicalItem = await getChemicalDetailByID(siteMasterId);
                    const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + chemicalItem.ID + "/";

                    let productPhotoURL;
                    if (chemicalItem.ProductPhoto) {
                        try {
                            const productPhotoData = JSON.parse(chemicalItem.ProductPhoto);
                            if (productPhotoData && productPhotoData.serverRelativeUrl) {
                                productPhotoURL = productPhotoData.serverRelativeUrl;
                            } else if (productPhotoData && productPhotoData.fileName) {
                                productPhotoURL = fixImgURL + productPhotoData.fileName;
                            } else {
                                productPhotoURL = notFoundImage;
                            }
                        } catch (error) {
                            console.error("Error parsing ProductPhoto JSON:", error);
                            productPhotoURL = notFoundImage;
                        }
                    } else {
                        productPhotoURL = notFoundImage;
                    }

                    const formattedSDSDate = chemicalItem.SDSDate ? moment(chemicalItem.SDSDate).format(DateFormat) : null;
                    const formattedExpirationDate = chemicalItem.ExpirationDate ? moment(chemicalItem.ExpirationDate).format(DateFormat) : null;
                    // let sdsURL = chemicalItem.SDS ? chemicalItem.SDS.Url : "";
                    // if (chemicalItem.IsSDSDocument) {
                    //     const data = await _getDocumentData(siteMasterId, props.provider);

                    //     if (data && data.length > 0) {
                    //         const urls: string[] = [];
                    //         for (const fileData of data) {
                    //             if (fileData?.FileRef) {
                    //                 const filePath: string = fileData.FileRef;
                    //                 const fileType = filePath.split('.').pop();
                    //                 const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${filePath}&action=embedview`;

                    //                 let DocumentFullPath: string;
                    //                 if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0) {
                    //                     DocumentFullPath = embedFullFilePath;
                    //                 } else {
                    //                     DocumentFullPath = fileType === "zip"
                    //                         ? `${filePath}?web=1&action=embedview`
                    //                         : filePath;
                    //                 }
                    //                 urls.push(DocumentFullPath);
                    //             }
                    //         }
                    //         sdsURL = urls.join(", ");
                    //     }
                    // }
                    let sdsURLParts: string[] = [];

                    // 🔹 Add SDS URL from the field, if available
                    if (chemicalItem.SDS?.Url) {
                        sdsURLParts.push(chemicalItem.SDS.Url);
                    }

                    // 🔹 Check and merge with SDS document URLs
                    if (chemicalItem.IsSDSDocument) {
                        const data = await _getDocumentData(siteMasterId, props.provider);

                        if (data && data.length > 0) {
                            for (const fileData of data) {
                                if (fileData?.FileRef) {
                                    const filePath: string = fileData.FileRef;
                                    const fileType = filePath.split('.').pop();
                                    const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${filePath}&action=embedview`;

                                    let DocumentFullPath: string;
                                    if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0) {
                                        DocumentFullPath = embedFullFilePath;
                                    } else {
                                        DocumentFullPath = fileType === "zip"
                                            ? `${filePath}?web=1&action=embedview`
                                            : filePath;
                                    }
                                    sdsURLParts.push(DocumentFullPath);
                                }
                            }
                        }
                    }

                    // ✅ Combine all parts into final SDS URL
                    const sdsURL = sdsURLParts.join(", ");

                    const items: ChemicalItem = {
                        ID: chemicalItem.Id,
                        Title: !!chemicalItem.Title ? chemicalItem.Title : "",
                        Manufacturer: !!chemicalItem.Manufacturer ? chemicalItem.Manufacturer : "",
                        SDSDate: !!formattedSDSDate ? formattedSDSDate : "",
                        Hazardous: !!chemicalItem.Hazardous ? chemicalItem.Hazardous : "",
                        HazClass: !!chemicalItem.HazClass ? chemicalItem.HazClass : [],
                        StorageRequest: !!chemicalItem.StorageRequest ? chemicalItem.StorageRequest : "",
                        StorageClass: !!chemicalItem.StorageClass ? chemicalItem.StorageClass : "",
                        pH: !!chemicalItem.pH ? chemicalItem.pH : "",
                        SDS: !!sdsURL ? sdsURL : "",
                        PPERequired: !!chemicalItem.PPERequired ? chemicalItem.PPERequired : [],
                        QCNotes: !!chemicalItem.QCNotes ? chemicalItem.QCNotes : "",
                        NumberOfItems: !!chemicalItem.NumberOfItems ? chemicalItem.NumberOfItems : "",
                        ExpirationDate: !!formattedExpirationDate ? formattedExpirationDate : "",
                        SDSDocument: !!chemicalItem.SDSDocument ? chemicalItem.SDSDocument : "",
                        ProductPhoto: !!productPhotoURL ? productPhotoURL : "",
                    };
                    setChemicalDetail(items);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
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
                ErrorMethodName: "useEffect ViewChemicalDetail"
            };
            void logGenerator(props.provider, errorObj);
        }
    }, []);

    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            let orgSiteId = props?.componentProp?.MasterId;
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.Chemical}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await props.provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    SiteNameId: orgSiteId,
                    ActionType: UserActivityActionTypeEnum.DetailsView,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.Chemical,
                    EntityId: siteMasterId,
                    EntityName: chemicalDetail?.Title,
                    Count: 1,
                    Details: "Details View"
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
            isCall.current = false;
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!!chemicalDetail && chemicalDetail?.Title !== "" && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [chemicalDetail]);

    const openModal2 = (filePath: string) => {
        setSelectedSDSUrl(filePath.trim());
        setShowModal(true);
    };

    return <>
        {isLoading && <Loader />}
        <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                            <div><h1 className="mainTitle">Chemical Details</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton
                                        className="btn btn-danger justifyright floatright"
                                        text="Back"
                                        onClick={onClickClose}

                                    />
                                </div>

                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <div className="customebreadcrumb">
                                <Breadcrumb
                                    items={props.breadCrumItems}
                                    maxDisplayedItems={3}
                                    ariaLabel="Breadcrumb with items rendered as buttons"
                                    overflowAriaLabel="More links"
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <section className="mt-3">
                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col-lg-3 col-md-4 mb-3">
                                            <label className="formLabel">
                                                Chemical Photo
                                            </label>
                                            <div className="">
                                                <img src={`${chemicalDetail?.ProductPhoto}`} className="img-fluid" />
                                            </div>
                                        </div>
                                        <div className="col-lg-9 col-md-8 mb-3">
                                            <div className="row">

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 ">
                                                    <label className="viewLabel" >Chemical Name </label >
                                                    <div className="mt1 listDetail inputText"> {chemicalDetail?.Title} </div>
                                                </div>

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            Manufacturer
                                                        </label>
                                                        <div className="mt1 listDetail inputText">{chemicalDetail?.Manufacturer}</div>
                                                    </div>
                                                </div>

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            SDS Date
                                                        </label>
                                                        <div className="mt1 listDetail inputText">{chemicalDetail?.SDSDate}</div>
                                                    </div>
                                                </div>

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            Hazardous
                                                        </label>
                                                        <div className="mt1 listDetail inputText">{chemicalDetail?.Hazardous}</div>
                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            pH
                                                        </label>
                                                        <div className="mt1 listDetail inputText">{chemicalDetail?.pH}</div>
                                                    </div>
                                                </div>

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            Storage Class
                                                        </label>
                                                        <div className="mt1 listDetail inputText">{chemicalDetail?.StorageClass}</div>
                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            Storage Request
                                                        </label>
                                                        <div className="mt1 listDetail inputText">
                                                            {chemicalDetail?.StorageRequest &&
                                                                <TooltipHost content={chemicalDetail?.StorageRequest} id={tooltipId}>
                                                                    {chemicalDetail?.StorageRequest}
                                                                </TooltipHost>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            SDS
                                                        </label>
                                                        {/* <div className="mt1 listDetail inputText cursorPointer" onClick={openModal}>
                                                            {
                                                                getFileName(chemicalDetail?.SDS)
                                                            }
                                                        </div> */}
                                                        <ul className="mt1 listDetail inputText" style={{ paddingLeft: "20px" }}>
                                                            {(chemicalDetail?.SDS || "")
                                                                .split(",")
                                                                .map((filePath, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="cursorPointer"
                                                                        onClick={() => openModal2(filePath.trim())}
                                                                        style={{ marginBottom: "4px", color: "#0059dfff", textDecoration: "underline" }}
                                                                    >
                                                                        {getFileName(filePath.trim())}
                                                                    </li>
                                                                ))}
                                                        </ul>


                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                </div>

                                            </div>
                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-lg-12 col-md-12 mb-3">
                                            <div className="row">
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            Haz Class
                                                        </label>
                                                        <div className="mt1 listDetail inputText">
                                                            {chemicalDetail && Array.isArray(chemicalDetail.HazClass) && chemicalDetail.HazClass.map((option: any, index: number) => (
                                                                <div key={index} className='greenBadge badge dInlineBlock'>
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            PPE Required
                                                        </label>
                                                        <div className="mt1 listDetail inputText">
                                                            {chemicalDetail && Array.isArray(chemicalDetail.PPERequired) && chemicalDetail.PPERequired.map((option: any, index: number) => (
                                                                <div key={index} className='greenBadge  badge dInlineBlock'>
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mb-3">
                                                    <div className="formGroup">
                                                        <label className="viewLabel">
                                                            Notes
                                                        </label>
                                                        <div className="mt1 listDetail inputText ml1px">{chemicalDetail?.QCNotes}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 mb-3">
                                            <h1 className="mainTitle">Chemical Associated</h1>
                                            <React.Suspense fallback={<Loader />}>
                                                <AssociatedChemicalMaster loginUserRoleDetails={props.loginUserRoleDetails} provider={props.provider} manageComponentView={manageComponentView} siteMasterId={siteMasterId} context={context} />
                                            </React.Suspense>
                                        </div>

                                        <div className="col-md-12 col-sm-12 col-12 mb-3 textRight">
                                            <PrimaryButton
                                                style={{ margin: "5px", marginTop: "10px" }}
                                                className="btn btn-danger"
                                                text="Back"
                                                onClick={onClickClose}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div >
        </div >


        {/* < Panel
            isOpen={showModal}
            onDismiss={() => closeModal()}
            type={PanelType.extraLarge}
            headerText="Document View"
        >
            <iframe src={chemicalDetail?.SDS} style={{ width: "100%", height: "90vh" }} />
        </Panel > */}
        <Panel
            isOpen={showModal}
            onDismiss={closeModal}
            type={PanelType.extraLarge}
            headerText="Document View"
        >
            {selectedSDSUrl && (
                <iframe
                    src={selectedSDSUrl}
                    style={{ width: "100%", height: "90vh", border: "none" }}
                />
            )}
        </Panel>

    </>;
};
