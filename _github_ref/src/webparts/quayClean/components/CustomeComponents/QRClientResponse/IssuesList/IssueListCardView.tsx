
import React, { useEffect, useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';
import NoRecordFound from '../../../CommonComponents/NoRecordFound';
import { IIssueCardProps } from '../../../../../../Interfaces/IAdCode';
import { ClientResponseViewFields } from '../ClientResponseFields';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ClientResponseActionMenu from './ClientResponseActionMenu';

export const IssueListCardView = (props: IIssueCardProps) => {

    const [listData, setListData] = useState<any[]>([]);

    const _onclickView = (view: any) => {
        props._onclickView(view);
    };

    const _onclickUnarchive = (view: any) => {
        props._onclickUnarchive?.(view);
    };

    const _onclickResolved = (view: any) => {
        props._onclickResolved?.(view);
    };

    const _onclickReAssigned = (view: any) => {
        props._onclickReAssigned?.(view);
    };

    const _onclickAttachment = (view: any) => {
        props._onclickAttachment(view);
    };

    useEffect(() => {
        setListData(props.items);
    }, [props.items]);

    return (
        <section className="hazard-card-view cardSection">

            <div className="row hazard-main-row">
                {listData.length > 0 && listData.map((data: any, index: any) => {
                    return (
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                            {/* <div className="thumbCard" onClick={() => { _onclickView(data); }}> */}
                            <div
                                className="thumbCard"
                                onClick={() => {
                                    _onclickView(data);
                                }}
                                style={{ cursor: "pointer" }}
                            >

                                <div className="thumbTitle position-relative">
                                    <div className="card-imnage-info">
                                        <div>
                                            {/* <div className="mb-1 card-imnage-info-title" onClick={() => { _onclickView(data); }}>{data.SiteName}</div> */}
                                            <div
                                                className="mb-1 card-imnage-info-title"
                                                onClick={() => {
                                                    _onclickView(data);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {data.SiteName}
                                            </div>

                                        </div>
                                    </div>
                                    {/* <a className="ContextualMenu" href="#" id="navbarDropdown" role="button">
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
                                                        iconProps: { iconName: 'View', style: { color: '#1300a6' } },
                                                        onClick: () => _onclickView(data),
                                                    },
                                                    {
                                                        key: 'viewAttachments',
                                                        name: 'View Attachments',
                                                        iconProps: { iconName: 'Attach', style: { color: '#ffa200' } },
                                                        // onRenderIcon: () => (
                                                        //     <FontAwesomeIcon icon="arrow-right-arrow-left" style={{ color: '#6f42c1' }} />
                                                        // ),
                                                        onClick: () => _onclickAttachment(data),
                                                    },
                                                    ...(data.IsArchive
                                                        ? [
                                                            {
                                                                key: 'unarchive',
                                                                name: 'Unarchive',
                                                                iconProps: { iconName: 'Sync', style: { color: 'orange' } },
                                                                onClick: () => _onclickUnarchive(data),
                                                            }]
                                                        : []),
                                                    ...(!data.IsArchive && !['Resolved', 'Not an Issue'].includes(data.Status)
                                                        ? [
                                                            {
                                                                key: 'resolve',
                                                                name: 'Mark as Resolved',
                                                                iconProps: { iconName: 'SkypeCircleCheck', style: { color: '#0aa82c' } },
                                                                onClick: () => _onclickResolved(data),
                                                            }]
                                                        : []),
                                                    ...(!data.IsArchive && !['Resolved', 'Not an Issue'].includes(data.Status)
                                                        ? [
                                                            {
                                                                key: 'reAssigne',
                                                                name: 'Reassign',
                                                                iconProps: { iconName: 'UserSync', style: { color: '#dc3545' } },
                                                                onClick: () => _onclickReAssigned(data),
                                                            }]
                                                        : []),

                                                ],
                                            }}
                                        />

                                    </a> */}
                                    <ClientResponseActionMenu
                                        data={data}
                                        onView={_onclickView}
                                        onAttachment={_onclickAttachment}
                                        onUnarchive={_onclickUnarchive}
                                        onResolve={_onclickResolved}
                                        onReassign={_onclickReAssigned}
                                    />


                                </div>
                                <div className="row fnt-14 mx-0">
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.Category}</label>
                                        <div className="fw-medium">{data.Category}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.SubCategory}</label>
                                        <div className="fw-medium">{data.SubCategory}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.ResponseFormId}</label>
                                        <div className="fw-medium">{data.ResponseFormId || "-"}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.ClientResponseStatus}</label>
                                        <div className="fw-medium">{data.Status || "-"}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.ReportedBy}</label>
                                        <div className="fw-medium">{data.ReportedBy || "-"}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.SubmissionDate}</label>
                                        <span className="fw-medium">
                                            {props.isChartView ?
                                                <div className="badge rounded-pill text-bg-info date-badge">{data.SubmissionDateDisplay}</div>
                                                : <div className="badge rounded-pill text-bg-info date-badge">{data.SubmissionDate}</div>}

                                        </span>
                                    </div>

                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.ResolvedDate}</label>
                                        <span className="fw-medium">
                                            {data.ResolvedDate ? <div className="badge rounded-pill text-bg-info date-badge">{data.ResolvedDate}</div> : "-"}
                                        </span>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{ClientResponseViewFields?.ResolvedBy}</label>
                                        <div className="fw-medium">{data.ResolvedBy || "-"}</div>
                                    </div>


                                </div>
                            </div>
                        </div>
                    )
                })}
                {listData.length == 0 && <>
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 "><NoRecordFound /></div>
                </>}
            </div>

        </section>
    );
};