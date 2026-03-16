/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import React, { useEffect, useState } from 'react';
import { useId } from '@uifabric/react-hooks';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

interface ICardProps {
    items: any[] | any;
    siteMasterId?: number;
}
interface Audit {
    ID: string; // or number, depending on your data
    SiteName: string;
    DocNumber: string;
    TemplateName: string;
    Score: number; // adjust the type as per your data structure
    Conductedon: string;
    Completed: string;
    WebReportURL: string;
    Date: string; // Add this if your audit object includes a Date field
}
export const InspectionDetailsCardView = (props: ICardProps) => {

    const [listData, setListData] = useState<any[]>([]);
    const tooltipId = useId('tooltip');

    useEffect(() => {
        setListData(props.items);
    }, [props.items])

    return (
        <section className="cardSection topInnerPadding">
            <div className="">
                <div className="row">

                    {Object.keys(listData).length > 0 && Object.keys(listData).map((date: string) => (
                        <>
                            {/* <div key={date} className="cardHeader-Action2">
                             <h3 className="ml14">{date}</h3> */}
                            {/* @ts-ignore */}
                            {listData[date].map((audit: Audit) => (  // Specify the audit type here
                                <div key={audit.ID} className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4 container22"
                                //onClick={() => onClick_InspectionData(audit)}
                                >
                                    <div className="thumbCard">
                                        <div className="thumbTitle position-relative">
                                            <h3 className="ml14">{audit.Date}</h3>
                                        </div>
                                        <div className="row fnt-14 mx-0">

                                            {!!props.siteMasterId && (
                                                <div className="card-other-content">
                                                    <label className="card-label">Site Name</label>
                                                    <div className="fw-medium">{audit.SiteName}</div>
                                                </div>
                                            )}

                                            <div className="card-other-content">
                                                <label className="card-label">Doc Number</label>
                                                <div className="fw-medium">{audit.DocNumber}</div>
                                            </div>

                                            <div className="card-other-content">
                                                <label className="card-label">Inspection</label>
                                                <div className="fw-medium">{audit.TemplateName}</div>
                                            </div>

                                            <div className="card-other-content">
                                                <label className="card-label">Score</label>
                                                <div className="fw-medium">{audit.Score}</div>
                                            </div>

                                            <div className="card-other-content w-auto">
                                                <label className="card-label">Conducted</label>
                                                <span className="fw-medium">{audit.Conductedon}</span>
                                            </div>

                                            <div className="card-other-content w-auto">
                                                <label className="card-label">Completed</label>
                                                <span className="fw-medium">{audit.Completed}</span>
                                            </div>

                                            <div className="card-other-content w-auto">
                                                <a
                                                    href="#"
                                                    onClick={() => window.open(audit.WebReportURL, '_blank')}
                                                    className="report-link"
                                                >
                                                    View Report
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* </div> */}
                        </>
                    ))}


                    {listData.length == 0 && <>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 "><NoRecordFound></NoRecordFound></div>
                    </>}
                </div>
            </div>
        </section>
    );
};