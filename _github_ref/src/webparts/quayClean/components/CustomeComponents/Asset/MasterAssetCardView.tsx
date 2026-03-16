import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { isWithinNextMonthRange } from '../../../../../Common/Util';
import { ContextualMenu, getTheme, IContextualMenuProps, Link, mergeStyleSets, TooltipHost } from '@fluentui/react';
import { IconButton } from 'office-ui-fabric-react';
require('../../../assets/css/gridView.css');
require('../../../assets/css/styles.css');
interface ICardProps {
    items: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    _onclickDetailsView: (itemID: any) => void;
    _onclickEdit: (itemID: any) => void;
    _onclickconfirmdelete: (itemID: any) => void;
    isEditDelete?: boolean;
    menu?: boolean;
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

export const MasterAssetCardView = (props: ICardProps) => {
    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [menuProps, setMenuProps] = useState<IContextualMenuProps | null>(null);

    const _onclickDetailsView = (view: any) => {
        props._onclickDetailsView(view);
    };

    const _onclickEdit = (view: any) => {
        props._onclickEdit(view);
    };
    useEffect(() => {
        setListData(props.items);
    }, [props.items])

    return (
        <section className="cardSection topInnerPadding0">
            <div className="">
                <div className="row">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        let isDueDate: boolean = false;
                        if (!!data.DueDate) {
                            isDueDate = isWithinNextMonthRange(data.fullServiceDueDate);
                        }
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4 cls-context mt-10" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <img src={data.AssetPhotoThumbnailUrl} className="card-photo" alt="Asset" />
                                            <div>
                                                <div className="mb-1" onClick={() => _onclickDetailsView(data)}>{data.Title}</div>

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
                                                            }
                                                        ] : []),
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

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Color</label>
                                            <span className="fw-medium">{data.QCColor}</span>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Asset Type</label>
                                            <span className="fw-medium">{data.AssetType}</span>
                                        </div>

                                    </div>
                                    {/* <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
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
                                    </div> */}
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