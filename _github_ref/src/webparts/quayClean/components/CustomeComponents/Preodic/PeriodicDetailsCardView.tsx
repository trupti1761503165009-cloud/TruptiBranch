import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, TooltipHost } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';

import { useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import { ComponentNameEnum } from '../../../../../Common/Enum/ComponentNameEnum';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import moment from "moment";
import { isWithinNextMonthRange } from '../../../../../Common/Util';
import { IconButton } from '@fluentui/react';

interface ICardProps {
    items: any[] | any;
    siteMasterId?: number;
    manageComponentView(componentProp: IQuayCleanState): any;
    _onclickHistory: (itemID: any) => void;
    isEditDelete?: boolean;
    _onclickEdit: (itemID: any) => void;  // Add _onclickEdit prop
    _onclickconfirmdelete: (itemID: any) => void;
}
export const PeriodicDetailsCardView = (props: ICardProps) => {

    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');

    const _onclickEdit = (view: any) => {
        props._onclickEdit(view);
    };

    const _onclickconfirmdelete = (view: any) => {
        props._onclickconfirmdelete(view);
    };

    const _onclickHistory = (view: any) => {
        props._onclickHistory(view);
    };

    useEffect(() => {
        setListData(props.items);
    }, [props.items])

    return (
        <section className="cardSection topInnerPadding">
            <div className="">
                <div className="row">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <div>
                                                <div className="mb-1">{data.SiteName}</div>
                                                {/* <div className="dFlex align-items-center"><label className="card-label">State: {data.QCState}</label></div> */}
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
                                                        {
                                                            key: 'periodicHistory',
                                                            name: 'Periodic History',
                                                            iconProps: { iconName: 'Timeline', style: { color: 'orange' } },
                                                            onClick: () => _onclickHistory(data),
                                                        },
                                                    ],
                                                }}
                                            />
                                        </a>
                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        <div className="card-other-content">
                                            <label className="card-label">Area</label>
                                            <div className="fw-medium">{data?.QCArea}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Sub Location</label>
                                            <div className="fw-medium">{data?.SubLocation}</div>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Work Type</label>
                                            <span className="fw-medium">{data?.WorkType}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Periodic Title</label>
                                            <span className="fw-medium">{data?.Title}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Frequency</label>
                                            <span className="fw-medium">{data?.Frequency}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Week</label>
                                            <span className="fw-medium">{data?.Week}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Month</label>
                                            <span className="fw-medium">{data?.Month}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Year</label>
                                            <span className="fw-medium">{data?.Year}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Job Completion</label>
                                            <span className="fw-medium">{data?.JobCompletion}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Task Date</label>
                                            <span className="fw-medium">{data?.TaskDate}</span>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Status</label>
                                            <span className="fw-medium">
                                                {(() => {
                                                    const isPastDate = (date: any) => {
                                                        return moment(date).isBefore(moment());
                                                    };
                                                    return <>
                                                        {(isWithinNextMonthRange(data.fullCompletionDate) && data.IsCompleted === false && isPastDate(data.CompletionDate)) ?
                                                            <div className="redBadgeact badge-mar-o">{data.CompletionDate}</div> : <div className="">{data.CompletionDate}</div>
                                                        }
                                                    </>;
                                                })()}
                                            </span>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Event Number</label>
                                            <span className="fw-medium">{data?.EventNumber}</span>
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