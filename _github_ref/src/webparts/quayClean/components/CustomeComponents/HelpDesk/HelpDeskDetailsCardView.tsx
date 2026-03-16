import React, { useEffect, useState } from 'react';
import { useId } from '@uifabric/react-hooks';
import { IQuayCleanState } from '../../QuayClean';
import NoRecordFound from '../../CommonComponents/NoRecordFound';
import { IconButton } from '@fluentui/react';

interface ICardProps {
    items: any[] | any;
    siteMasterId?: number;
    manageComponentView(componentProp: IQuayCleanState): any;
    isEditDelete?: boolean;
    _onclickEdit: (itemID: any) => void;  // Add _onclickEdit prop
    _onclickconfirmdelete: (itemID: any) => void;
}

export const HelpDeskDetailsCardView = (props: ICardProps) => {

    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
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
        <section className={props.isEditDelete ? "cardSection sitetopInnerPadding2" : "cardSection topInnerPadding2"}>
            <div className="">
                <div className="row">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                <div className="mobilethumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            <div>
                                                <div className="mb-1">{data.SiteName}</div>
                                            </div>
                                        </div>
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
                                        <div className="card-other-content">
                                            <label className="card-label">Help Desk Description</label>
                                            <div className="fw-medium">{data?.Title}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Date & Time</label>
                                            <div className="fw-medium">{data?.StartingDateTime}</div>
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Caller</label>
                                            <span className="fw-medium">{data?.Caller}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Location</label>
                                            <span className="fw-medium">{data?.Location}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Sub Location</label>
                                            <span className="fw-medium">{data?.SubLocation}</span>
                                        </div>
                                        {/* <div className="card-other-content w-auto">
                                            <label className="card-label">Area</label>
                                            <span className="fw-medium">{data?.QCArea}</span>
                                        </div> */}
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Priority</label>
                                            <span className="fw-medium">{data?.QCPriority}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Category</label>
                                            <span className="fw-medium">{data?.HDCategory}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
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
                                        </div>

                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Event Name</label>
                                            <span className="fw-medium">{data?.EventName}</span>
                                        </div>
                                        <div className="card-other-content w-auto">
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
                                        </div>
                                        <div className="card-other-content w-auto">
                                            <label className="card-label">Help Desk Description</label>
                                            <span className="fw-medium">
                                                {data?.HelpDeskName}
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