import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, TooltipHost } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { isWithinNextMonthRange } from '../../../../../Common/Util';
import { Checkbox, getTheme, IconButton, mergeStyleSets } from '@fluentui/react';
import moment from 'moment';
import { defaultValues } from '../../../../../Common/Enum/ComponentNameEnum';
require('../../../assets/css/gridView.css');
require('../../../assets/css/styles.css');
interface ICardProps {
    items: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    _onclickDetailsView: (itemID: any) => void;
    setState: React.Dispatch<React.SetStateAction<any>>;
    setKeyUpdate: (key: number) => void;
    setFileURL: (url: string) => void;  // Add setFileURL prop
    openModal: () => void;  // Add openModal prop
    _onclickEdit: (itemID: any) => void;  // Add _onclickEdit prop
    _onclickconfirmdelete: (itemID: any) => void;
    isEdit?: boolean;
    isDelete?: boolean;
    isSiteDelete?: boolean;
    sitenameid: any;
    onSelectCards?: (selected: any[]) => void;
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

export const ChemicalCardView = (props: ICardProps) => {
    const [listData, setListData] = useState<any[]>([]);
    const [selectedCards, setSelectedCards] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [showCallout, { setTrue: onShowCallout, setFalse: onHideCallout }] = useBoolean(false);

    const _onclickDetailsView = (view: any) => {
        props._onclickDetailsView(view);
    };

    const _onclickEdit = (view: any) => {
        props._onclickEdit(view);
    };

    const _onclickconfirmdelete = (view: any) => {
        props._onclickconfirmdelete(view);
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
    let oneMonthDate = moment(new Date()).add(29, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
    let threeMonthDate = moment(new Date()).add(60, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";

    return (
        <section className="cardSection topInnerPadding2">
            <div className="row mb-2 mar-l-14">
                {listData.length > 0 && (
                    // <div className="col-12 d-flex align-items-center" style={{ paddingLeft: '15px' }}>
                    <Checkbox
                        label={isAllSelected ? "Deselect All" : "Select All"}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                    // className="checkbox-Position"
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
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                {/* <div className={window.innerWidth > 768 ? "thumbCard" : {!!props?.isSiteDelete && props?.isSiteDelete ? "sitemobilethumbCard" : "mobilethumbCard" }}> */}
                                <div className={
                                    window.innerWidth > 768
                                        ? "thumbCard"
                                        : (props?.isSiteDelete ? "sitemobilethumbCard" : "mobilethumbCard")
                                }>
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
                                            <img src={data.ProductPhotoThumbnailUrl} className="card-photo" alt="Asset" />
                                            <div>
                                                <div className="mb-1" style={{ paddingRight: "40px" }} onClick={() => _onclickDetailsView(data)}>{data.Title}</div>
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
                                                        ...(props.isEdit
                                                            ? [
                                                                {
                                                                    key: 'edit',
                                                                    name: 'Edit',
                                                                    iconProps: { iconName: 'Edit', style: { color: 'blue' } },
                                                                    onClick: () => _onclickEdit(data), // Pass `data` from the loop
                                                                }]
                                                            : []),
                                                        ...((props.isDelete && props.sitenameid)
                                                            ? [
                                                                {
                                                                    key: 'delete',
                                                                    name: 'Delete',
                                                                    iconProps: { iconName: 'Delete', style: { color: 'red' } },
                                                                    onClick: () => {
                                                                        props.setState((prevState: any) => ({
                                                                            ...prevState,
                                                                            isDeletedModelOpen: true,
                                                                            deleteItemId: Number(data.ID)
                                                                        }));
                                                                    }, // Pass `data` from the loop
                                                                }]
                                                            : []),
                                                        ...(props.isSiteDelete && props.sitenameid
                                                            ? [
                                                                {
                                                                    key: 'delete',
                                                                    name: 'Delete',
                                                                    iconProps: { iconName: 'Delete', style: { color: 'red' } },
                                                                    onClick: () => _onclickconfirmdelete(data), // Pass `data` from the loop
                                                                }]
                                                            : []),
                                                    ],
                                                }}
                                            />

                                        </a>
                                        {/* <a className="" href="#" id="navbarDropdown" role="button">
                                            <Link className="actionBtn btnView" onClick={() => _onclickDetailsView(data)}>
                                                <TooltipHost content={"View Site Detail"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="eye" />
                                                </TooltipHost>
                                            </Link>
                                        </a> */}
                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        <div className="card-other-content">
                                            <label className="card-label">Manufacturer</label>
                                            <div className="fw-medium">{data?.Manufacturer}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">SDS Date</label>
                                            <div className="fw-medium">{data?.SDSDate}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Hazardous</label>
                                            <div className="fw-medium">
                                                <div className={data.Hazardous === "Yes" ? 'redBadge mw-50 badge' : 'greenBadge mw-50 badge truncate'}>
                                                    {data?.Hazardous}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Expiration Date</label>
                                            <span className="fw-medium">
                                                {data.FullExpirationDate < oneMonthDate ? (
                                                    <div className="redBadge mw-110 badge truncate">{data.ExpirationDate}</div>
                                                ) : data.FullExpirationDate > oneMonthDate && data.FullExpirationDate < threeMonthDate ? (
                                                    <div className="yellowBadge mw-110 badge truncate">{data.ExpirationDate}</div>
                                                ) : (
                                                    <div className="greenBadge mw-110 badge truncate">{data.ExpirationDate}</div>
                                                )}
                                            </span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Has Class</label>
                                            <span className="fw-medium">
                                                {Array.isArray(data.HazClass) && data.HazClass.length > 0 ? (
                                                    data.HazClass.map((option: any, index: number) => (
                                                        <div key={index} className="greenBadge badge truncate">
                                                            {option}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>No Class</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Storage Req.</label>
                                            <span className="fw-medium">
                                                {data.StorageRequest != null ? (
                                                    <Link className="tooltipcls">
                                                        <TooltipHost content={data.StorageRequest} id={tooltipId}>
                                                            {data.StorageRequest.length > 75 ? `${data.StorageRequest.slice(0, 75)}...` : data.StorageRequest}
                                                        </TooltipHost>
                                                    </Link>
                                                ) : (
                                                    <Link className="tooltipcls">
                                                        <TooltipHost content="Storage Request Not Available" id={tooltipId}>
                                                            Not Available
                                                        </TooltipHost>
                                                    </Link>
                                                )}
                                            </span>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">pH</label>
                                            <span className="fw-medium">{data.pH}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">SDS</label>
                                            <span className="fw-medium">
                                                <Link className="actionBtn dticon" onClick={() => {
                                                    props.setFileURL(data.SDS);
                                                    props.openModal();
                                                }}>
                                                    <TooltipHost content="View Document" id={tooltipId}>
                                                        <FontAwesomeIcon icon="link" />
                                                    </TooltipHost>
                                                </Link>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <TooltipHost content="View QR Code" id={tooltipId}>
                                                <div onClick={() => {
                                                    props.setKeyUpdate(Math.random());
                                                    props.setState((prevState: any) => ({ ...prevState, isQRCodeModelOpen: true, quChemical: "Chemical", qrDetails: data, qrCodeUrl: data.QRCodeUrl }));

                                                }}>
                                                    <img src={data.QRCodeUrl} height="75px" width="75px" className="course-img-first" />
                                                </div>
                                            </TooltipHost>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {listData.length == 0 && <>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 "><NoRecordFound></NoRecordFound></div>
                    </>}
                </div>
            </div>
        </section >
    );
};