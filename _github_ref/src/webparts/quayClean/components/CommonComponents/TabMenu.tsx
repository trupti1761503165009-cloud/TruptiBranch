import React, { useEffect, useState } from 'react';

interface IStasteProps {
    stateMasterItems: any[];
    TotalCount?: any;
    onStateChange: (stateId: any, stateObj?: any) => void;
}
const TabMenu: React.FunctionComponent<IStasteProps> = (props: IStasteProps): React.ReactElement => {

    const [activeTab, setActiveTab] = useState("");
    const [states, setStates] = useState<any[]>([]);

    useEffect(() => {
        // const states = currentUserRoleDetail.stateMasterItems.map(item => item.Title);
        // const states = props.stateMasterItems.map(item => ({
        //     Id: item.Id,
        //     Title: item.Title
        // }));

        let allOption: any;
        if (props.stateMasterItems[0]?.Count != undefined) {
            const total = props.stateMasterItems.reduce((acc, item) => {
                const count = typeof item.Count === 'number' ? item.Count : 0;
                return acc + count;
            }, 0);
            let AllCount = props?.TotalCount ? props?.TotalCount : total;
            allOption = { Id: "", Title: "All", Count: AllCount };
        } else {
            allOption = { Id: "", Title: "All", Count: undefined };
        }

        const updatedStates = [allOption, ...props.stateMasterItems];
        setStates(updatedStates);
        console.log(states);

    }, [props.stateMasterItems]);

    const handleTabChange = (state: any, stateObj: any) => {
        setActiveTab(state);
        props.onStateChange(state, stateObj);
    };

    return (
        <div className="tab-menu">
            {states.map((state) => (
                <div
                    key={state.Id}
                    className={`tab-item ${activeTab === state.Id ? 'active' : ''}`}
                    onClick={() => handleTabChange(state.Id, state)}
                >
                    {state.Title} {(state.Count != undefined && state.count != 'NAN') && `(${state.Count})`}
                </div>
            ))}
        </div>
    );
};

export default TabMenu;