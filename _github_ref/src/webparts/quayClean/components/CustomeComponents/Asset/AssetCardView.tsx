import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { formatPrice, formatPriceDecimal, isWithinNextMonthRange } from '../../../../../Common/Util';
import { Checkbox, ContextualMenu, getTheme, IContextualMenuProps, Link, mergeStyleSets, TooltipHost } from '@fluentui/react';
import { IconButton } from 'office-ui-fabric-react';
import { AMStatus } from '../../../../../Common/Constants/CommonConstants';
require('../../../assets/css/gridView.css');
require('../../../assets/css/styles.css');
interface ICardProps {
    items: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    _onclickDetailsView: (itemID: any) => void;
    _onclickMovingHistory: (itemID: any) => void;
    _onclickEdit: (itemID: any) => void;
    _onclickconfirmdelete: (itemID: any) => void;
    setState: React.Dispatch<React.SetStateAction<any>>;
    setKeyUpdate: (key: number) => void;
    isEditDelete?: boolean;
    menu?: boolean;
    onSelectCards?: (selected: any[]) => void;
    _onclickCopyAsset?: (itemID: any) => void;
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

export const AssetCardView = (props: ICardProps) => {
    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [selectedCards, setSelectedCards] = useState<any[]>([]);
    const [showCallout, { setTrue: onShowCallout, setFalse: onHideCallout }] = useBoolean(false);
    const [menuProps, setMenuProps] = useState<IContextualMenuProps | null>(null);

    const _onclickDetailsView = (view: any) => {
        props._onclickDetailsView(view);
    };

    const _onclickMovingHistory = (view: any) => {
        props._onclickMovingHistory(view);
    };

    const _onclickEdit = (view: any) => {
        props._onclickEdit(view);
    };

    const _onclickconfirmdelete = (view: any) => {
        props._onclickconfirmdelete(view);
    };

    const _onclickCopyAssetItem = (view: any) => {
        props?._onclickCopyAsset && props?._onclickCopyAsset(view);
    };

    useEffect(() => {
        setListData(props.items);
    }, [props.items])

    const handleCardSelect = (data: any) => {
        setSelectedCards(prev => {
            const updated = prev.some(item => item.ID === data.ID)
                ? prev.filter(item => item.ID !== data.ID)
                : [...prev, data];
            props.onSelectCards && props.onSelectCards(updated);
            return updated;
        });
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const updated = event.target.checked ? listData : [];
        setSelectedCards(updated);
        props.onSelectCards && props.onSelectCards(updated);
    };

    const isAllSelected = listData.length > 0 && selectedCards.length === listData.length;
    return (
        <section className="cardSection topInnerPadding0 zoneCardBox">
            <div className="row mb-2">
                {listData.length > 0 && (
                    // <div className="col-12 d-flex align-items-center" style={{ paddingLeft: '15px' }}>
                    <Checkbox
                        label={isAllSelected ? "Deselect All" : "Select All"}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                    />
                    // </div>
                )}
            </div>
            <div className="">
                <div className="row">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        let isDueDate: boolean = false;
                        if (!!data.DueDate) {
                            isDueDate = isWithinNextMonthRange(data.fullServiceDueDate);
                        }
                        const isSelected = selectedCards.some(item => item.ID === data.ID);
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4 cls-context mt-10" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className={`checkbox-Position-Left ${isSelected ? 'selected-card-border' : ''}`}>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleCardSelect(data)}
                                                className="checkbox-Position-Left"
                                                styles={{
                                                    root: { position: 'absolute', top: 5, right: 5, zIndex: 10 },
                                                }}
                                            />
                                        </div>
                                        <div className="card-imnage-info">
                                            <img src={data.AssetPhotoThumbnailUrl} className="card-photo" alt="Asset" />
                                            <div>
                                                <div className="mb-1" onClick={() => _onclickDetailsView(data)}>{data.Title}</div>
                                                {data?.SiteName && <div className="dFlex align-items-center">
                                                    <label className="card-label">Site Name: {data.SiteName}</label>
                                                </div>}
                                            </div>
                                        </div>
                                        <a className="ContextualMenu" href="#" id="navbarDropdown" role="button">

                                            <IconButton
                                                id="ContextualMenuButton1"
                                                text=""
                                                width="5"
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
                                                        ...(props.isEditDelete ? [
                                                            {
                                                                key: 'edit',
                                                                name: 'Edit',
                                                                iconProps: { iconName: 'Edit', style: { color: 'blue' } },
                                                                onClick: () => _onclickEdit(data),
                                                            },
                                                            {
                                                                key: 'delete',
                                                                name: 'Delete',
                                                                iconProps: { iconName: 'Delete', style: { color: 'red' } },
                                                                onClick: () => _onclickconfirmdelete(data),
                                                            }
                                                        ] : []),
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
                                                                props.setState((prevState: any) => ({
                                                                    ...prevState,
                                                                    isShowAssetHistoryModel: true,
                                                                    isAssociatModel: false,
                                                                    isShowMovingModel: false,
                                                                    isShowDueDateModel: false,
                                                                    siteNameId: data.SiteNameId,
                                                                    assetMasterId: data.ID,
                                                                }));
                                                            },
                                                        },
                                                        ...(props.menu ? [
                                                            ...(data.Status === AMStatus.Moving ? [
                                                                {
                                                                    key: 'acquireAsset',
                                                                    name: 'Acquire Asset',
                                                                    iconProps: { iconName: 'HandsFree', style: { color: 'maroon' } },
                                                                    onClick: () => {
                                                                        props.setState((prevState: any) => ({
                                                                            ...prevState,
                                                                            isShowAcquireModel: true,
                                                                            siteNameId: data.SiteNameId,
                                                                            assetMasterId: data.ID,
                                                                        }));
                                                                    },
                                                                },
                                                            ] : [
                                                                {
                                                                    key: 'moveAsset',
                                                                    name: 'Move Asset',
                                                                    iconProps: { iconName: 'People', style: { color: 'purple' } },
                                                                    onClick: () => {
                                                                        props.setState((prevState: any) => ({
                                                                            ...prevState,
                                                                            isShowMovingModel: true,
                                                                            siteNameId: data.SiteNameId,
                                                                            assetMasterId: data.ID,
                                                                        }));
                                                                    },
                                                                },
                                                            ]),
                                                            ...(data.AssetTypeMasterId === 0 ? [
                                                                {
                                                                    key: 'associateAssetType',
                                                                    name: 'Associate Asset Type',
                                                                    iconProps: { iconName: 'Add', style: { color: 'blue' } },
                                                                    onClick: () => {
                                                                        props.setState((prevState: any) => ({
                                                                            ...prevState,
                                                                            AssetTypeMasterId: 0,
                                                                            isAssociatModel: true,
                                                                            siteNameId: data.SiteNameId,
                                                                            assetMasterId: data.ID,
                                                                        }));
                                                                    },
                                                                },
                                                            ] : [
                                                                {
                                                                    key: 'updateAssetType',
                                                                    name: 'Update Associated Asset Type',
                                                                    iconProps: { iconName: 'Edit', style: { color: 'green' } },
                                                                    onClick: () => {
                                                                        props.setState((prevState: any) => ({
                                                                            ...prevState,
                                                                            AssetTypeMasterId: data.AssetTypeMasterId,
                                                                            AssetTypeMaster: data.AssetTypeMaster,
                                                                            isAssociatModel: true,
                                                                            siteNameId: data.SiteNameId,
                                                                            assetMasterId: data.ID,
                                                                        }));
                                                                    },
                                                                },
                                                            ]),
                                                        ] : []),
                                                        ...(isDueDate ? [
                                                            {
                                                                key: 'dueDate',
                                                                name: 'Due Date',
                                                                iconProps: { iconName: 'Clock', style: { color: 'maroon' } },
                                                                onClick: () => {
                                                                    props.setState((prevState: any) => ({
                                                                        ...prevState,
                                                                        isShowDueDateModel: true,
                                                                        siteNameId: data.SiteNameId,
                                                                        assetMasterId: data.ID,
                                                                    }));
                                                                },
                                                            },
                                                        ] : []),
                                                        {
                                                            key: 'copyAssetItem',
                                                            name: 'Copy Asset Item',
                                                            iconProps: { iconName: 'Copy', style: { color: 'orange' } },
                                                            onClick: () => _onclickCopyAssetItem(data),
                                                        },
                                                    ],
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
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Acquisition Value</label>
                                            <span className="fw-medium">{data.AcquisitionValue !== "" &&
                                                <Link className="tooltipcls">
                                                    <TooltipHost content={data.AcquisitionValue} id={tooltipId}>
                                                        {data?.AcquisitionValue ? formatPriceDecimal(data?.AcquisitionValue) : ''}
                                                    </TooltipHost>
                                                </Link>}</span>
                                        </div>
                                        {
                                            data?.AcquisitionValue > 1000 &&
                                            <div className="card-other-content w-auto">
                                                <label className="card-label">FA Number</label>
                                                <span className="fw-medium">
                                                    {data.FANumber !== "" && (
                                                        <Link className="tooltipcls">
                                                            <TooltipHost content={`${data.FANumber}`} id={tooltipId}>
                                                                {!!data?.FANumber ? `${data?.FANumber}` : ""}
                                                            </TooltipHost>
                                                        </Link>
                                                    )}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <TooltipHost content="View QR Code" id={tooltipId}>
                                                <div onClick={() => {
                                                    props.setKeyUpdate(Math.random());
                                                    props.setState((prevState: any) => ({
                                                        ...prevState,
                                                        isQrModelOpen: true,
                                                        qrDetails: data,
                                                        qrCodeUrl: data.QRCode,
                                                    }));
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