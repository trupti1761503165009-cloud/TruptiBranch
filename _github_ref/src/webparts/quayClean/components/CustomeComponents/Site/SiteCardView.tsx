import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Callout, DefaultButton, Link, TooltipHost } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { isWithinNextMonthRange } from '../../../../../Common/Util';
import { getTheme, mergeStyleSets } from '@fluentui/react';
require('../../../assets/css/gridView.css');
require('../../../assets/css/styles.css');

interface ICardProps {
    items: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    _onclickDetailsView: (itemID: any) => void;

    // Add the new props
    ListDocuments: any;  // Define the type as needed
    ListTeam: any;       // Define the type as needed
    ListChemical: any;   // Define the type as needed
    ListEquipment: any;  // Define the type as needed
    _onClickCount: (itemID: any, page: string) => void;  // Define the type as needed
    onFavouriteClick?: (item: any) => void;

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

export const SiteCardView = (props: ICardProps) => {
    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [showCallout, { setTrue: onShowCallout, setFalse: onHideCallout }] = useBoolean(false);

    const _onclickDetailsView = (view: any) => {
        props._onclickDetailsView(view);
    };

    useEffect(() => {
        setListData(props.items);
    }, [props.items])

    return (
        <section className="cardSection topInnerPadding">
            <div className="">
                <div className="row">
                    {!!listData && listData?.length > 0 && listData.map((data: any, index: any) => {
                        let isDueDate: boolean = false;
                        if (!!data.DueDate) {
                            isDueDate = isWithinNextMonthRange(data.fullServiceDueDate);
                        }
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <img src={data.img} className="card-photo" alt="Asset" />
                                            <div>
                                                <div className="mb-1" onClick={() => _onclickDetailsView(data)}>{data.Title}</div>
                                                <div className="dFlex align-items-center">
                                                    <label className="card-label">State: {data.QCState}</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='action-buttons'>
                                            <a className="" href="javascript:void(0)" id="navbarDropdown" role="button">
                                                <Link className="actionBtn btnView" onClick={() => _onclickDetailsView(data)}>
                                                    <TooltipHost content={"View Site Detail"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="eye" />
                                                    </TooltipHost>
                                                </Link>
                                            </a>
                                            <a className="" href="javascript:void(0)" id="navbarDropdown" role="button">
                                                <Link className="actionBtn btnEdit dticon" onClick={() => {
                                                }}>
                                                    <TooltipHost
                                                        content={"Favourite"}
                                                        id={tooltipId}
                                                    >
                                                        <div onClick={() => props.onFavouriteClick?.(data)}>
                                                            <FontAwesomeIcon icon={data.IsFavourite ? 'star' : ['far', 'star']} />
                                                        </div>
                                                    </TooltipHost>
                                                </Link>
                                            </a>
                                        </div>

                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        <div className="card-other-content">
                                            <label className="card-label">Site Manager</label>
                                            <div className="fw-medium">{<Link className="tooltipcls">
                                                {data?.SM.length > 0 && data?.SM?.map((item: any) => (
                                                    <li className="ulli">
                                                        {item}
                                                    </li>
                                                ))}
                                            </Link>}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Site Supervisor</label>
                                            <div className="fw-medium">{<Link className="tooltipcls">
                                                {data?.SS.length > 0 && data?.SS?.map((item: any) => (
                                                    <li className="ulli">
                                                        {item}
                                                    </li>
                                                ))}
                                            </Link>}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Client</label>
                                            <div className="fw-medium">{<Link className="tooltipcls">
                                                {data?.UserUS.length > 0 && data?.UserUS?.map((item: any) => (
                                                    <li className="ulli">
                                                        {item}
                                                    </li>
                                                ))}
                                            </Link>}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Category
                                                <div className="cursorPointer">
                                                    {data.Category}
                                                </div>
                                            </label>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Equipment/Asset</label>
                                            {data.Assets >= 0 ? (
                                                <div className="cursorPointer primaryColor" onClick={() => props._onClickCount(data.ID, "AssetsPage")}>
                                                    <Link className="primaryColor">
                                                        <TooltipHost content={"View Detail"} id={tooltipId}>
                                                            <span className={`${data.Assets > 0 ? 'countBadge' : ""}`}>{data.Assets}</span>
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                            ) : (
                                                props.ListEquipment.current === undefined ? (
                                                    <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
                                                ) : (
                                                    <span className="userCollaborateIcon bg-warning">0</span>
                                                )
                                            )}
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Chemicals</label>
                                            {data.Chemical >= 0 ? (
                                                <div className="cursorPointer primaryColor" onClick={() => props._onClickCount(data.ID, "ChemicalsPage")}>
                                                    <Link className="primaryColor">
                                                        <TooltipHost content={"View Detail"} id={tooltipId}>
                                                            <span className={`${data.Chemical > 0 ? 'countBadge' : ""}`}>{data.Chemical}</span>
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                            ) : (
                                                props.ListChemical.current === undefined ? (
                                                    <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
                                                ) : (
                                                    <span className="userCollaborateIcon bg-warning">0</span>
                                                )
                                            )}
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Team</label>
                                            {data.Team >= 0 ? (
                                                <div className="cursorPointer primaryColor" onClick={() => props._onClickCount(data.ID, "TeamsPage")}>
                                                    <Link className="primaryColor">
                                                        <TooltipHost content={"View Detail"} id={tooltipId}>
                                                            <span className={`${data.Team > 0 ? 'countBadge' : ""}`}>{data.Team}</span>
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                            ) : (
                                                props.ListTeam.current === undefined ? (
                                                    <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
                                                ) : (
                                                    <span className="userCollaborateIcon bg-warning">0</span>
                                                )
                                            )}
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Audit Reports</label>
                                            {data.Documents >= 0 ? (
                                                <div className="cursorPointer primaryColor" onClick={() => props._onClickCount(data.ID, "DocumentsPage")}>
                                                    <Link className="primaryColor">
                                                        <TooltipHost content={"View Detail"} id={tooltipId}>
                                                            <span className={`${data.Documents > 0 ? 'countBadge' : ""}`}>{data.Documents}</span>
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                            ) : (
                                                props.ListDocuments.current === undefined ? (
                                                    <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
                                                ) : (
                                                    <span className="userCollaborateIcon bg-warning">0</span>
                                                )
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {!!listData && listData?.length == 0 && <>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 "><NoRecordFound></NoRecordFound></div>
                    </>}
                </div>
            </div>
        </section >
    );
};