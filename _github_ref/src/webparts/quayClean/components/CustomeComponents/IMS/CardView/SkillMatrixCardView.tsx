
import React, { useEffect, useState } from 'react';
import { useId } from '@uifabric/react-hooks';
import { ComponentNameEnum } from '../../../../../../Common/Enum/ComponentNameEnum';
import NoRecordFound from '../../../CommonComponents/NoRecordFound';
import { ICardProps } from '../../../../../../Interfaces/IAdCode';
import { IconButton } from '@fluentui/react';

export const SkillMatrixCardView = (props: ICardProps) => {

    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');

    const _onclickEdit = (view: any) => {
        props._onclickEdit(view);
    };

    const _onclickconfirmdelete = (view: any) => {
        props._onclickconfirmdelete(view);
    };

    const _SkillMatrixSignature = (ID: any, DATA: any) => {
        if (props._SkillMatrixSignature) {
            props._SkillMatrixSignature(ID, DATA);
        } else {
            console.log("");
        }
    };


    useEffect(() => {
        setListData(props.items);
    }, [props.items]);

    const onViewClick = (data: any): void => {
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.DetailSkillMatrix,
            siteMasterId: data.ID,
            isNotGeneral: props.isNotGeneral,
            siteName: data.SiteName || "Site not link",
            originalSiteMasterId: props.IMSsiteMasterId,
            isTabView: props.isTabView, viewType: props.viewType,
        });


        // originalState: props.originalState || props.componentProps.originalState, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, 
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
                                                <div className="mb-1 card-title" onClick={() => { onViewClick(data) }}>{data.SiteName || "Site not link"}</div>
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
                                                        ...(props.isEditDelete || props.isNotGeneral === false
                                                            ? [
                                                                {
                                                                    key: 'edit',
                                                                    name: 'Edit',
                                                                    iconProps: { iconName: 'Edit', style: { color: 'blue' } },
                                                                    onClick: () => _onclickEdit(data), // Pass `data` from the loop
                                                                }]
                                                            : []),
                                                        ...(props.isEditDelete || props.isNotGeneral === false
                                                            ? [
                                                                {
                                                                    key: 'delete',
                                                                    name: 'Delete',
                                                                    iconProps: { iconName: 'Delete', style: { color: 'red' } },
                                                                    onClick: () => _onclickconfirmdelete(data), // Pass `data` from the loop
                                                                }]
                                                            : []),
                                                        ...(props.isEditDelete && data.IsCompleted !== true
                                                            ? [
                                                                {
                                                                    key: 'competency',
                                                                    name: 'Competency',
                                                                    iconProps: { iconName: 'Add', style: { color: 'blue' } },
                                                                    onClick: () => _SkillMatrixSignature(data.ID, data),
                                                                }]
                                                            : []),
                                                    ],
                                                }}
                                            />

                                        </a>
                                    </div>
                                    <div className="row fnt-14 mx-0 ">
                                        <div className="card-other-content">
                                            <label className="card-label">Skill Matrix</label>
                                            <div className="fw-medium">{data.Title}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Venue Trained</label>
                                            <div className="fw-medium">{data.VenueTrained}</div>
                                        </div>
                                        <div className="card-other-content">
                                            <label className="card-label">Attendees</label>
                                            <div className="fw-medium">{data.TrainingAttendance}</div>
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