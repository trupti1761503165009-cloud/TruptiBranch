import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, TooltipHost } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';

import { useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import { ComponentNameEnum } from '../../../../../Common/Enum/ComponentNameEnum';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { IconButton } from '@fluentui/react';

interface ICardProps {
    items: any[] | any;
    siteMasterId?: number;
    _onclickDetailsView: (itemID: any) => void;
    manageComponentView(componentProp: IQuayCleanState): any;
    isEditDelete?: boolean;
    _onclickEdit: (itemID: any) => void;  // Add _onclickEdit prop
    _onclickconfirmdelete: (itemID: any) => void;
}
export const ClientResponseDetailsCardView = (props: ICardProps) => {

    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');

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

    return (
        <section className="cardSection topInnerPadding2">
            <div className="">
                <div className="row">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            {/* <img src={data.img} className="card-photo" alt="Asset" /> */}
                                            <div>
                                                <div className="mb-1" onClick={() => _onclickDetailsView(data)}>{data.SiteName}</div>
                                                {/* <div className="dFlex align-items-center">
                                                    <label className="card-label">State: {data.QCState}</label>
                                                </div> */}
                                            </div>
                                        </div>
                                        {!props?.siteMasterId && <a className="" href="#" id="navbarDropdown" role="button">
                                            <Link className="actionBtn btnView" onClick={() => _onclickDetailsView(data)}>
                                                <TooltipHost content={"View Site Detail"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="eye" />
                                                </TooltipHost>
                                            </Link>
                                        </a>}
                                        {props?.siteMasterId && <a className="ContextualMenu" href="#" id="navbarDropdown" role="button">
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
                                                        ...(props.isEditDelete
                                                            ? [
                                                                {
                                                                    key: 'edit',
                                                                    name: 'Edit',
                                                                    iconProps: { iconName: 'Edit', style: { color: 'blue' } },
                                                                    onClick: () => _onclickEdit(data), // Pass `data` from the loop
                                                                }]
                                                            : []),
                                                        ...(props.isEditDelete
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

                                        </a>}
                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        {/* {!!props.siteMasterId && ( */}
                                        {/* <div className="card-other-content">
                                            <label className="card-label">Site Name</label>
                                            <div className="fw-medium">{data?.SiteName}</div>
                                        </div> */}
                                        {/* )} */}



                                        <div className="card-other-content">
                                            <label className="card-label">Client Title</label>
                                            <div className="fw-medium">{data?.Title}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Log In Time</label>
                                            <div className="fw-medium">{data?.LogInTime}</div>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Area</label>
                                            <span className="fw-medium">{data?.Area}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Request</label>
                                            <span className="fw-medium">{data?.Request}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Who Are Involved</label>
                                            <span className="fw-medium">{data?.WhoAreInvolved}</span>
                                        </div>
                                        {/* <div className="card-other-content w-auto">
                                            <label className="card-label">Area</label>
                                            <span className="fw-medium">{data?.QCArea}</span>
                                        </div> */}
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Has The Solution Worked?</label>
                                            <span className="fw-medium">{data?.HasTheSolutionWorked}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Is Completed?</label>
                                            <span className="fw-medium">{data?.IsCompleted}</span>
                                        </div>
                                        {/* <div className="card-other-content w-auto">
                                            <label className="card-label">Status</label>
                                            <span className="fw-medium">
                                                {(() => {
                                                    let badgeClass = '';
                                                    if (data?.HDStatus === "Pending") {
                                                        badgeClass = 'pendingBadge statusBadge badge dinline1';
                                                    } else if (data?.HDStatus === "In progress") {
                                                        badgeClass = 'inProgressBadge statusBadge badge dinline1';
                                                    } else if (data?.HDStatus === "Completed") {
                                                        badgeClass = 'completedBadge statusBadge badge dinline1';
                                                    }
                                                    return (
                                                        <div className={badgeClass}>
                                                            {data?.HDStatus}
                                                        </div>
                                                    );
                                                })()}
                                            </span>
                                        </div> */}

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Response Completion Date</label>
                                            <span className="fw-medium">{data?.ResponseCompletionDate}</span>
                                        </div>
                                        {/* <div className="card-other-content w-auto">
                                            <label className="card-label">Report HelpDesk</label>
                                            <span className="fw-medium">
                                                {(() => {
                                                    let badgeClass = '';
                                                    if (data.ReportHelpDesk === "No") {
                                                        badgeClass = 'redBadge mw-50 badge';
                                                    } else {
                                                        badgeClass = 'greenBadge mw-50 badge truncate';
                                                    }
                                                    return (
                                                        <div className={badgeClass}>
                                                            {data.ReportHelpDesk}
                                                        </div>
                                                    );
                                                })()}
                                            </span>
                                        </div> */}
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Building</label>
                                            <span className="fw-medium">
                                                {data?.Building}
                                            </span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Feedback</label>
                                            <span className="fw-medium">
                                                {data?.Feedback}
                                            </span>
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
        </section>
    );
};