
import React, { useEffect, useState } from 'react';
import NoRecordFound from '../../../CommonComponents/NoRecordFound';
import { IIssueCardProps } from '../../../../../../Interfaces/IAdCode';
import { IconButton } from '@fluentui/react';
import { HazardViewFields } from '../../../../../../Common/Enum/HazardFields';

export const HazardCardView = (props: IIssueCardProps) => {

    const [listData, setListData] = useState<any[]>([]);

    const _onclickView = (view: any) => {
        props._onclickView(view);
    };

    const _onclickUnarchive = (view: any) => {
        props._onclickUnarchive?.(view);
    };

    const _onclickSiteUpdate = (view: any) => {
        props._onclickSiteUpdate?.(view);
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
                                                        onClick: () => _onclickView(data),
                                                    },
                                                    ...(data.IsArchive
                                                        ? [
                                                            {
                                                                key: 'unarchive',
                                                                name: 'Unarchive',
                                                                iconProps: { iconName: 'Sync', style: { color: 'orange' } },
                                                                // onRenderIcon: () => (
                                                                //     <FontAwesomeIcon icon="arrow-rotate-right" style={{ color: 'orange' }} />
                                                                // ),
                                                                onClick: () => _onclickUnarchive(data),
                                                            }]
                                                        : []),
                                                    {
                                                        key: 'moveSite',
                                                        name: 'Move Site',
                                                        iconProps: { iconName: 'Switch', style: { color: '#6f42c1' } },
                                                        // onRenderIcon: () => (
                                                        //     <FontAwesomeIcon icon="arrow-right-arrow-left" style={{ color: '#6f42c1' }} />
                                                        // ),
                                                        onClick: () => _onclickSiteUpdate(data),
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
                                                ],
                                            }}
                                        />

                                    </a>


                                </div>
                                <div className="row fnt-14 mx-0">
                                    <div className="card-other-content">
                                        <label className="card-label">{HazardViewFields?.HazardType}</label>
                                        <div className="fw-medium">{data.HazardType}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{HazardViewFields?.HazardSubType}</label>
                                        <div className="fw-medium">{data.HazardSubType}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{HazardViewFields?.FormID}</label>
                                        <div className="fw-medium">{data.HazardFormId}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{HazardViewFields?.SubmittedBy}</label>
                                        <div className="fw-medium">{data.SubmittedBy}</div>
                                    </div>
                                    <div className="card-other-content">
                                        <label className="card-label">{HazardViewFields?.SubmissionDate}</label>
                                        <span className="fw-medium">
                                            {props.isChartView ?
                                                <div className="badge rounded-pill text-bg-info date-badge">{data.SubmissionDateDisplay}</div>
                                                : <div className="badge rounded-pill text-bg-info date-badge">{data.SubmissionDate}</div>}

                                        </span>

                                    </div>
                                </div>
                                <div className="row fnt-14 mx-0">
                                    <div className="card-other--ml--15">
                                        <label className="card-label">{HazardViewFields?.Description}</label>
                                        <div className="fw-medium">{data?.ResponseJSON?.response?.commonQuestions?.answers?.find(
                                            (a: any) => a.label === "Hazard Description"
                                        )?.value || '—'}</div>
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