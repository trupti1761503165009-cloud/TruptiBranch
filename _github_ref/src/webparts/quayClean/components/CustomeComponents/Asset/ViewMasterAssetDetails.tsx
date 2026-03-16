/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider"; import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { _onItemSelected, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { Breadcrumb, Link, Panel, PanelType, Pivot, PivotItem, PrimaryButton, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { Loader } from "../../CommonComponents/Loader";
import moment from "moment";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
export interface IAssetDetailsProps {
    provider: IDataProvider;
    context: WebPartContext;
    manageComponentView(componentProp: IQuayCleanState): any;
    masterAssetId?: number;
    preViousCompomentName?: string;
    breadCrumItems: any[];
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
}

export const ViewMasterAssetDetails = (props: IAssetDetailsProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const [ListEquipment, setListEquipment] = React.useState<any>([]);
    const [isPanelOpen, setisPanelOpen] = React.useState<boolean>(false);
    const [url, seturl] = React.useState<string>("");
    const tooltipId = useId('tooltip');
    const [videoLinks, setVideoLinks] = React.useState<any>([]);
    const [VideoURL, setVideoURL] = React.useState<string>("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const isCall = React.useRef<boolean>(true);

    const handleLinkClick = (link: any, index: any) => {
        const trimmedLink = link.trim();
        const lastSegment = trimmedLink.substring(trimmedLink.lastIndexOf('/') + 1);
        let finalLink = "https://www.youtube.com/embed/" + lastSegment;
        setActiveIndex(index);
        setVideoURL(finalLink);
    };

    const _GlobalAssetData = () => {
        try {
            const select = ["ID,Attachments,AttachmentFiles,Title,AssetType,AssetLink,Manufacturer,Model,QCColor,AssetPhoto,AssetPhotoThumbnailUrl,WebsiteLink"];
            const expand = ["AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                listName: ListNames.GlobalAssets,
                filter: `ID eq '${props.masterAssetId}' and IsDeleted ne 1`,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const AssetListData = results.map((data) => {
                        const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/GlobalAssets/Attachments/' + data.ID + "/";
                        let AssetPhotoURL;
                        let attachmentFiledata;
                        if (data.AttachmentFiles.length > 0) {
                            try {
                                const AttachmentData = data.AttachmentFiles[0];
                                if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                    attachmentFiledata = AttachmentData.ServerRelativeUrl;
                                } else if (AttachmentData && AttachmentData.FileName) {
                                    attachmentFiledata = fixImgURL + AttachmentData.FileName;
                                } else {
                                    attachmentFiledata = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                attachmentFiledata = notFoundImage;
                            }
                        } else {
                            attachmentFiledata = null;
                        }
                        if (data.AssetPhoto) {
                            try {
                                const AssetPhotoData = JSON.parse(data.AssetPhoto);
                                if (AssetPhotoData && AssetPhotoData.serverRelativeUrl) {
                                    AssetPhotoURL = AssetPhotoData.serverRelativeUrl;
                                } else if (AssetPhotoData && AssetPhotoData.fileName) {
                                    AssetPhotoURL = fixImgURL + AssetPhotoData.fileName;
                                } else {
                                    AssetPhotoURL = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                AssetPhotoURL = notFoundImage;
                            }
                        } else {
                            AssetPhotoURL = notFoundImage;
                        }

                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                AssetType: !!data.AssetType ? data.AssetType : "",
                                Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                                Model: !!data.Model ? data.Model : "",
                                Color: !!data.QCColor ? data.QCColor : "",
                                AssetImage: AssetPhotoURL,
                                WebsiteLink: !!data.WebsiteLink ? data.WebsiteLink : "",
                                Attachment: attachmentFiledata,
                                AssetLink: !!data.AssetLink ? data.AssetLink : "",
                            }
                        );
                    });
                    setListEquipment(AssetListData);
                    let links = AssetListData[0]?.AssetLink?.Url?.split(',');
                    const trimmedLink = links[0]?.trim();
                    const lastSegment = trimmedLink.substring(trimmedLink.lastIndexOf('/') + 1);
                    let finalLink = "https://www.youtube.com/embed/" + lastSegment;
                    setVideoURL(finalLink);
                    setVideoLinks(links);

                }
            }).catch((error) => {
                console.log(error);
                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while  _GlobalAssetData",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "_GlobalAssetData AssetDetails"
                };
                void logGenerator(props.provider, errorObj);
            });

        } catch (ex) {
            console.log(ex);
        }
    };

    const onPanelclose = () => {
        setisPanelOpen(false);
    };

    const _userActivityLog = async () => {

        setIsLoading(true);
        try {
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.masterAssetId}' and EntityType eq '${UserActionEntityTypeEnum.MasterAssets}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                    ActionType: UserActivityActionTypeEnum.DetailsView,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.MasterAssets,
                    EntityId: props?.masterAssetId,
                    EntityName: ListEquipment[0]?.Title,
                    Count: 1,
                    Details: "Details View",
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
            }
            isCall.current = false;
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }

    };

    React.useEffect(() => {
        if (!!props.masterAssetId) {
            _GlobalAssetData();

        }
    }, [props.masterAssetId]);

    React.useEffect(() => {
        if (!!ListEquipment && ListEquipment.length > 0 && ListEquipment[0]?.Title !== "" && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [ListEquipment]);

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onPanelclose} text="Close" />
        </div>;
    };

    const onClickBackClose = () => {
        const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.GlobalAssetsList, view: props?.componentProp?.view, breadCrumItems: breadCrumItems
        });
    };

    return <>
        {isLoading && <Loader />}
        <Panel
            isOpen={isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.extraLarge}
            onRenderFooterContent={onRenderFooterContent}
        >
            <iframe
                src={url}
                style={{ width: "100%", height: "100vh" }}
            />

        </Panel>

        {!!ListEquipment[0] &&
            <div className="boxCard">
                <main>
                    <section className="pt-4">
                        <div className="">

                            <div className="row">
                                <div className="col-12 dFlex justifyContentBetween mb-3">
                                    <div><h2 className="mainTitle mb-0">Assets Details</h2></div>
                                    <div className="dFlex">
                                        <div>
                                            <PrimaryButton className="btn btn-danger" text="Back"
                                                onClick={() => { onClickBackClose() }}
                                            />
                                        </div>
                                    </div>

                                </div>
                                <div className="col-12 dFlex justifyContentBetween mb-3">
                                    <div className="customebreadcrumb">
                                        <Breadcrumb
                                            items={props.breadCrumItems}
                                            maxDisplayedItems={3}
                                            ariaLabel="Breadcrumb with items rendered as buttons"
                                            overflowAriaLabel="More links"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-4 mb-3">
                                    <div className="">
                                        <img src={`${ListEquipment[0]?.AssetImage}`} className="img-fluid" />

                                    </div>
                                </div>
                                <div className="col-lg-9 col-md-8 mb-3">
                                    <div className="row">
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Assets Name
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0]?.Title}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Manufacturer
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0]?.Manufacturer}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Model
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0]?.Model}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Assets Type
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0]?.AssetType}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Color
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0]?.Color}</div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Asset Manual
                                                </label>
                                                {ListEquipment[0]?.Attachment != null ?
                                                    <div className="inputText" style={{ display: "flex" }}>

                                                        {/* <Link className="actionBtn btnPDF dticon ml5 " target="_blank" href={ListEquipment[0]?.Attachment}>
                                                            <TooltipHost
                                                                content={"View Document"}
                                                                id={tooltipId}
                                                            >
                                                                <FontAwesomeIcon icon="file-pdf" />
                                                            </TooltipHost>
                                                        </Link > */}
                                                        <a
                                                            className="actionBtn btnPDF dticon ml5"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={ListEquipment[0]?.Attachment}
                                                        >
                                                            {/* <TooltipHost content={"View Document"} id={tooltipId}> */}
                                                            <FontAwesomeIcon icon="file-pdf" />
                                                            {/* </TooltipHost> */}
                                                        </a>
                                                        <TooltipHost
                                                            content={"View Document"}
                                                            id={tooltipId}
                                                        >
                                                            <a target="_blank" onClick={() => { window.open(ListEquipment[0]?.Attachment, '_blank'); }} >
                                                                View Document
                                                            </a></TooltipHost>
                                                    </div> : <div className="inputText listDetail">No document available</div>}
                                            </div>
                                        </div>

                                        <div className="col-lg-3 col-md-12 col-sm-12 col-12">
                                            <div className="formgroup">
                                                <label className="viewLabel">
                                                    Website Link
                                                </label>
                                                {ListEquipment[0]?.WebsiteLink ?
                                                    <div className="dflex">
                                                        <Link
                                                            className="actionBtn dticon sitelinkBtn"
                                                            onClick={() => {
                                                                const url = ListEquipment[0]?.WebsiteLink;
                                                                if (url) {
                                                                    window.open(url, '_blank');
                                                                }
                                                            }}
                                                        >
                                                            <TooltipHost content={"View Website Link"} id={tooltipId}>
                                                                <FontAwesomeIcon icon="link" /><span className="linklbl">Click to open</span>
                                                            </TooltipHost>
                                                        </Link> </div> :
                                                    <span>Website link not found</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-lg-6 col-12 col-md-12 mb-3">
                                    <div><h2 className="mainTitle">  Video Link</h2></div>
                                    {VideoURL != "" ?
                                        <div className="ratio mb-3">
                                            <iframe className="" src={VideoURL} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
                                        </div> :
                                        <div className="inputText">No Video Available</div>
                                    }

                                    <div className="videoThumb">
                                        {videoLinks?.map((link: any, index: any) => (
                                            <div className="">
                                                <div key={index} className={`video-link-item2 ${activeIndex === index ? 'active' : ''}`} onClick={() => handleLinkClick(link, index)}>
                                                    <div className="VideoLinkCLS">
                                                        <span
                                                            style={{ cursor: 'pointer', color: 'blue', marginRight: '0px', marginLeft: '0px', marginBottom: '3px' }}
                                                        >
                                                            <img src={require('../../../assets/images/videoicon.svg')} width={45} height={45} />
                                                            {/* <img src={require("../../assets/images/video-camera-alt.svg")} /> */}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12 col-sm-12 col-12 mb-3 textRight">
                                    <PrimaryButton className="btn btn-danger justifyright floatright mb-3" text="Back"
                                        onClick={() => { onClickBackClose() }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section >
                </main >
            </div >
        }
    </>;
};

