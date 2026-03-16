import React, { useEffect, useState } from 'react';

interface IStasteProps {
    stateMasterItems: any[];
    onStateChange: (stateId: any) => void;
    TotalCount?: any;
    defaultStateId?: string; // <-- optional prop
}
const TabMenu: React.FunctionComponent<IStasteProps> = (props: IStasteProps): React.ReactElement => {

    const [activeTab, setActiveTab] = useState("");
    const [states, setStates] = useState<any[]>([]);

    useEffect(() => {
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

        const defaultId = props.defaultStateId ?? "";
        if (defaultId)
            setActiveTab(defaultId);
        // props.onStateChange(defaultId); // Optionally trigger callback with default

    }, [props.stateMasterItems, props.defaultStateId]);


    const handleTabChange = (state: any) => {
        setActiveTab(state);
        props.onStateChange(state);
    };

    return (
        <div className="tab-menu">
            {states.map((state) => (
                <div
                    key={state.Id}
                    className={`tab-item ${activeTab === state.Id ? 'active' : ''}`}
                    onClick={() => handleTabChange(state.Id)}
                >
                    {state.Title} {(state.Count != undefined && state.count != 'NAN') && `(${state.Count})`}
                </div>
            ))}
        </div>
    );
};

export default TabMenu;