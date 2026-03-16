import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, TooltipHost } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import { useId } from '@uifabric/react-hooks';
import { ComponentNameEnum } from '../../../../../../Common/Enum/ComponentNameEnum';
import NoRecordFound from '../../../CommonComponents/NoRecordFound';
import { ICardProps } from '../../../../../../Interfaces/IAdCode';
import { IconButton } from '@fluentui/react';

export const IncidentReportCardView = (props: ICardProps) => {

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
    }, [props.items]);

    const onViewClick = (data: any): void => {
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.DetailToolboxIncident,
            siteMasterId: data.ID,
            originalSiteMasterId: props.IMSsiteMasterId,
            isTabView: props.isTabView,
            viewType: props.viewType,
        });
    };

    return (
        <section className="cardSection topInnerPadding">
            <div className="">
                <div className="row ">
                    {listData.length > 0 && listData.map((data: any, index: any) => {
                        return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                                <div className="thumbCard">
                                    <div className="thumbTitle position-relative">
                                        <div className="card-imnage-info">
                                            {/* <img src={data.img} className="card-photo"></img> */}
                                            <div>
                                                <div className="mb-1 card-title" onClick={() => { onViewClick(data); }}>{data.SiteName}</div>
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
                                                        {
                                                            key: 'detailview',
                                                            name: 'Detail View',
                                                            iconProps: { iconName: 'View', style: { color: 'skyblue' } },
                                                            onClick: () => onViewClick(data),
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

                                        </a>
                                        {/* <a className="" href="#" id="navbarDropdown" role="button">
                                            <Link className="actionBtn btnView" onClick={() => { onViewClick(data); }}>
                                                <TooltipHost content={"View Site Detail"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="eye" />
                                                </TooltipHost>
                                            </Link>
                                        </a> */}
                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        <div className="card-other-content">
                                            <label className="card-label">Report</label>
                                            <div className="fw-medium">{data.ReportId}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Incident Date</label>
                                            <div className="fw-medium">{data.IncidentDate}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Attendees</label>
                                            <div className="fw-medium">{data.Attendees}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Form Status</label>
                                            <div className="fw-medium">{data.FormStatus}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Created Date</label>
                                            <div className="fw-medium">{data.Created}</div>
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
            </div>
        </section>
    );
};