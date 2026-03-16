import React from "react"

export interface ISummeryCardProps {
    stateNames: any[];
    siteName: any[];
    entityType: any[];
    actionType: any[];
    users: any[];
    stateDate: string;
    endDate: string

}

export const SummeryCard = (props: ISummeryCardProps) => {

    return <div className="summeryCard">


        <div className="section">
            {(!!props.stateNames && props.stateNames.length > 0) && <div><strong>State: </strong> {props.stateNames.join(', ')}</div>}
            {(!!props.siteName && props.siteName.length > 0) && <div><strong>Site Name: </strong> {props.siteName.join(', ')}</div>}
            {(!!props.entityType && props.entityType.length > 0) && <div><strong>Entity Type: </strong> {props.entityType.join(', ')}</div>}
            {(!!props.actionType && props.actionType.length > 0) && <div><strong>Action Type: </strong> {props.actionType.join(', ')}</div>}
            {(!!props.users && props.users.length > 0) && <div><strong>User: </strong> {props.users.join(', ')}</div>}

            {(!!props.stateDate && !!props.endDate) && <div><strong>Selected Date Range:{" "}</strong>
                {props?.stateDate?.split("-")?.reverse().join("-")} to {props?.endDate?.split("-")?.reverse()?.join("-")}
            </div>
            }
        </div>

        {/* <div className="last-border"></div> */}
    </div>
}