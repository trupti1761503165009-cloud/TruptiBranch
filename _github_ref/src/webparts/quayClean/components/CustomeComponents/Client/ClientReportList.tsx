import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const ClientReportList = ({ filteredData }: any) => {
    const [groupedData, setGroupedData] = useState<any>({});
    const [expandedEntities, setExpandedEntities] = useState<any>({});
    const [expandedActions, setExpandedActions] = useState<any>({});

    useEffect(() => {
        let sortedData = !!(filteredData && filteredData.length > 0) ? filteredData.sort((a: any, b: any) => new Date(b.OrgModified).getTime() - new Date(a.OrgModified).getTime()) : []
        const grouped = !!sortedData && sortedData.reduce((acc: any, item: any) => {
            const entity = item.EntityName || 'Unknown Entity';
            const action = item.ActionType;
            const user = item.UserName;

            if (!acc[entity]) {
                acc[entity] = {
                    actions: {},
                    users: new Set(),
                    lastDate: item.Modified,
                };
            }

            acc[entity].users.add(user);

            if (new Date(item.Modified) > new Date(acc[entity].lastDate)) {
                acc[entity].lastDate = item.Modified;
            }

            if (!acc[entity].actions[action]) {
                acc[entity].actions[action] = {
                    users: {},
                };
            }

            if (!acc[entity].actions[action].users[user]) {
                acc[entity].actions[action].users[user] = [];
            }

            acc[entity].actions[action].users[user].push(item);

            return acc;
        }, {});
        setGroupedData(grouped);
    }, [filteredData]);

    const toggleEntity = (entity: string) => {
        setExpandedEntities((prev: any) => ({
            ...prev,
            [entity]: !prev[entity],
        }));
    };

    const toggleAction = (entity: string, action: string) => {
        const key = `${entity}-${action}`;
        setExpandedActions((prev: any) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div>
            {!!filteredData && filteredData.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded shadow mt-5">
                    <div className="chart-div-table">
                        <div className="chart-div-header">
                            <div className="chart-div-cell">Entity Name</div>
                            <div className="chart-div-cell">Total Actions</div>
                            <div className="chart-div-cell">Unique Users</div>
                            <div className="chart-div-cell">Last Activity Date</div>
                        </div>
                        {Object.entries(groupedData).map(([entity, entityInfo]: any, i: number) => {
                            const totalActions = Object.values(entityInfo.actions)
                                .flatMap((a: any) => Object.values(a.users).flatMap((u: any) => u)).length;
                            return (
                                <div key={entity}>
                                    <div
                                        className={`chart-div-row ${i % 2 !== 0 ? 'white-bg' : ''}`}
                                        onClick={() => toggleEntity(entity)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="chart-div-cell">
                                            <div className="dflex">
                                                <FontAwesomeIcon
                                                    className="dticon me-2"
                                                    icon={expandedEntities[entity] ? faCaretDown : faCaretRight}
                                                />
                                                {entity}
                                            </div>
                                        </div>
                                        <div className="chart-div-cell">{totalActions}</div>
                                        <div className="chart-div-cell">{entityInfo.users.size}</div>
                                        <div className="chart-div-cell">{entityInfo.lastDate}</div>
                                    </div>

                                    {expandedEntities[entity] && (
                                        <div style={{ paddingLeft: '20px' }}>
                                            {Object.entries(entityInfo.actions).map(([actionType, actionData]: any) => {
                                                const key = `${entity}-${actionType}`;
                                                const actionCount = Object.values(actionData.users).flatMap((u: any) => u).length;

                                                return (
                                                    <div key={key}>
                                                        <div
                                                            className="chart-div-row white-bg"
                                                            onClick={() => toggleAction(entity, actionType)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className="chart-div-cell">
                                                                <div className="dflex">
                                                                    <FontAwesomeIcon
                                                                        className="dticon me-2"
                                                                        icon={expandedActions[key] ? faCaretDown : faCaretRight}
                                                                    />
                                                                    {actionType}
                                                                </div>
                                                            </div>
                                                            <div className="chart-div-cell">{actionCount}</div>
                                                            <div className="chart-div-cell">
                                                                {Object.keys(actionData.users).length}
                                                            </div>
                                                            <div className="chart-div-cell">—</div>
                                                        </div>

                                                        {expandedActions[key] && (
                                                            <div style={{ paddingLeft: '20px' }}>
                                                                <div className="header-drag" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                                                                    <div className="header-cell-drag2">Entity Name</div>
                                                                    <div className="header-cell-drag2">Details</div>
                                                                    <div className="header-cell-drag2">Site Name</div>
                                                                    <div className="header-cell-drag2">User Name</div>
                                                                    <div className="header-cell-drag2">Timestamp</div>
                                                                </div>

                                                                {Object.entries(actionData.users).map(([user, userItems]: any) =>
                                                                    userItems.map((item: any, idx: number) => (
                                                                        <div key={idx} className="row-drag draggable-drag" style={{ width: '100%' }}>
                                                                            <div className="header-cell-drag2">{item.EntityName}</div>
                                                                            <div className="header-cell-drag2">{item.Details}</div>
                                                                            <div className="header-cell-drag2">{item.SiteName}</div>
                                                                            <div className="header-cell-drag2">{item.UserName}</div>
                                                                            <div className="header-cell-drag2">{item.Modified}</div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientReportList;