import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Callout, DefaultButton, Link, TooltipHost } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { getFileTypeIcon, isWithinNextMonthRange } from '../../../../../Common/Util';
import { Callout, ContextualMenu, DefaultButton, getTheme, IContextualMenuProps, Link, mergeStyleSets, TooltipHost } from '@fluentui/react';
import { IconButton } from 'office-ui-fabric-react';
require('../../../assets/css/gridView.css');
require('../../../assets/css/styles.css');
interface ICardProps {
    items: any;
    // manageComponentView(componentProp: IQuayCleanState): any;
    // _onclickDetailsView: (itemID: any) => void;
    // _onclickMovingHistory: (itemID: any) => void;
    // setState: React.Dispatch<React.SetStateAction<any>>;  // Add setState prop
    // setKeyUpdate: (key: number) => void;
}

const theme = getTheme();
const classNames = mergeStyleSets({
    iconContainer: {
        position: 'relative',
        margin: '0 4px',
        height: 32,
        width: 14,
    },
    logoIcon: {
        position: 'absolute',
        left: 0,
        right: 0,
        color: theme.palette.themeDarkAlt,
    },
    logoFillIcon: {
        position: 'absolute',
        left: 0,
        right: 0,
        color: theme.palette.white,
    },
});

export const AddDocumentCardView = (props: ICardProps) => {
    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [showCallout, { setTrue: onShowCallout, setFalse: onHideCallout }] = useBoolean(false);
    const [menuProps, setMenuProps] = useState<IContextualMenuProps | null>(null);


    const _onclickDetailsView = (view: any) => {
        // props._onclickDetailsView(view);
    };

    const _onclickMovingHistory = (view: any) => {
        // props._onclickMovingHistory(view);
    };

    useEffect(() => {
        setListData(props.items);
    }, [props.items])

    return (
        <section className="cardSection topInnerPadding">
            <div className="">
                <div className="row">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        let isDueDate: boolean = false;
                        if (!!data.DueDate) {
                            isDueDate = isWithinNextMonthRange(data.fullServiceDueDate);
                        }
                        let fileIcon = getFileTypeIcon(data.FileLeafRef);
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            {/* <img src={data.AssetPhotoThumbnailUrl} className="card-photo" alt="Asset" /> */}
                                            {data.ContentType === "Folder" ?
                                                <FontAwesomeIcon className="folderBtn btnfolder dticon" icon="folder" /> :
                                                <img className="fileIcon dticon" src={fileIcon} />
                                            }
                                            <div>
                                                <div className="mb-1" onClick={() => _onclickDetailsView(data)}>{data.Title}</div>
                                                <div className="dFlex align-items-center">
                                                    <label className="card-label">Site Name: {data.SiteName}</label>
                                                </div>
                                            </div>
                                        </div>

                                        <a className="ContextualMenu" href="#" id="navbarDropdown" role="button">
                                            <IconButton id='ContextualMenuButton1'
                                                text=''
                                                width='20'
                                                split={false}
                                                iconProps={{ iconName: 'MoreVertical' }}
                                                menuIconProps={{ iconName: '' }}
                                                menuProps={{
                                                    shouldFocusOnMount: true,
                                                    items: [
                                                        {
                                                            key: 'detailview',
                                                            name: 'Detail View',
                                                            iconProps: { iconName: 'View', style: { color: 'skyblue' } },
                                                            onClick: () => _onclickDetailsView(data),
                                                        },
                                                        {
                                                            key: 'movingHistory',
                                                            name: 'Moving History',
                                                            iconProps: { iconName: 'Timeline', style: { color: 'orange' } },
                                                            onClick: () => _onclickMovingHistory(data),
                                                        },
                                                        {
                                                            key: 'assetHistory',
                                                            name: 'Asset History',
                                                            iconProps: { iconName: 'History', style: { color: 'green' } },
                                                            onClick: () => {
                                                                // props.setState((prevState: any) => ({
                                                                //     ...prevState,
                                                                //     isShowAssetHistoryModel: true,
                                                                //     isAssociatModel: false,
                                                                //     isShowMovingModel: false,
                                                                //     isShowDueDateModel: false,
                                                                //     siteNameId: data.SiteNameId,
                                                                //     assetMasterId: data.ID
                                                                // }));
                                                            },
                                                        },
                                                        {
                                                            key: 'dueDate',
                                                            name: 'Due Date',
                                                            iconProps: { iconName: 'Clock', style: { color: 'maroon' } },
                                                            onClick: onShowCallout,
                                                            disabled: !isDueDate,
                                                        },
                                                    ]
                                                }}
                                            />
                                        </a>
                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        <div className="card-other-content">
                                            <label className="card-label">Manufacturer</label>
                                            <div className="fw-medium">{data?.Manufacturer}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Model</label>
                                            <div className="fw-medium">{data?.Model}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Book value</label>
                                            <div className="fw-medium">{data?.PurchasePrice}</div>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Color</label>
                                            <span className="fw-medium">{data.QCColor}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Status</label>
                                            <span className="fw-medium">{data.Status}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Category</label>
                                            <span className="fw-medium">{data.AssetCategory}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Asset Type</label>
                                            <span className="fw-medium">{data.AssetType}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Service Due Date</label>
                                            <div className="fw-medium dflex">
                                                {!!data.DueDate && isWithinNextMonthRange(data.fullServiceDueDate) ? (
                                                    <div className="redBadgeact badge-mar-o">{data.ServiceDueDate}</div>
                                                ) : (
                                                    <span>{data.ServiceDueDate}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Serial Number</label>
                                            <span className="fw-medium">{data.SerialNumber !== "" &&
                                                <Link className="tooltipcls">
                                                    <TooltipHost content={data.SerialNumber} id={tooltipId}>
                                                        {data.SerialNumber}
                                                    </TooltipHost>
                                                </Link>}</span>
                                        </div>
                                    </div>
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <TooltipHost content="View QR Code" id={tooltipId}>
                                                <div onClick={() => {
                                                    // props.setKeyUpdate(Math.random());
                                                    // props.setState((prevState: any) => ({
                                                    //     ...prevState,
                                                    //     isQrModelOpen: true,
                                                    //     qrDetails: data,
                                                    //     qrCodeUrl: data.QRCode,
                                                    // }));
                                                }}>
                                                    <img src={data.QRCode} height="75px" width="75px" className="course-img-first" />
                                                </div>
                                            </TooltipHost>
                                            <div>
                                                <div className="dFlex align-items-center"><label className="card-label">Audit Reports:

                                                    {data.Attachment != null ?

                                                        <><Link className="actionBtn btnPDF dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(data.Attachment, '_blank'); }}>
                                                            <TooltipHost
                                                                content={"View Audit Reports"}
                                                                id={tooltipId}
                                                            >
                                                                <FontAwesomeIcon icon="file-pdf" />
                                                            </TooltipHost>
                                                        </Link></>
                                                        :
                                                        <Link className="actionBtn btnDisable dticon">
                                                            <TooltipHost
                                                                content={"Document Not Available"}
                                                                id={tooltipId} >
                                                                <FontAwesomeIcon icon="file-pdf" />
                                                            </TooltipHost>

                                                        </Link >
                                                    }
                                                </label></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {listData.length == 0 && <>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 "><NoRecordFound></NoRecordFound></div>
                    </>}
                    {menuProps && (
                        <ContextualMenu
                            {...menuProps}
                            onDismiss={() => setMenuProps(null)} // Dismiss menu when clicked outside
                        />
                    )}
                </div>
            </div>
        </section >
    );
};