import React, { useEffect, useState } from "react";

interface IMultiStateTabProps {
    stateMasterItems: any[];
    selectedStateIds: number[];
    onStateChange: (stateIds: number[], options?: any[]) => void;
}

const MultiStateTabMenu: React.FC<IMultiStateTabProps> = ({
    stateMasterItems,
    selectedStateIds,
    onStateChange,
}) => {

    const [states, setStates] = useState<any[]>([]);

    useEffect(() => {
        const total = stateMasterItems[0]?.Count !== undefined
            ? stateMasterItems.reduce((acc, item) => acc + (item.Count || 0), 0)
            : undefined;

        const allOption = { Id: 0, Title: "All", Count: total };
        setStates([allOption, ...stateMasterItems]);

    }, [stateMasterItems]);

    // const toggleSelection = (clicked: any) => {
    //     const allIds = states.filter(s => s.Id !== 0).map(s => s.Id);
    //     let updatedIds: number[] = [];

    //     if (clicked.Id === 0) {
    //         if (selectedStateIds.length === allIds.length || selectedStateIds.length === 0) {
    //             updatedIds = [];
    //         } else {
    //             updatedIds = allIds;
    //         }
    //     } else {
    //         if (selectedStateIds.includes(clicked.Id)) {
    //             updatedIds = selectedStateIds.filter(id => id !== clicked.Id);
    //         } else {
    //             updatedIds = [...selectedStateIds, clicked.Id];
    //         }
    //     }

    //     const updatedOptions = updatedIds.length
    //         ? states.filter(s => updatedIds.includes(s.Id))
    //         : [];

    //     onStateChange(updatedIds, updatedOptions);
    // };

    // const isActive = (id: number) => {
    //     if (id === 0) {
    //         return selectedStateIds.length === 0;
    //     }
    //     return selectedStateIds.includes(id);
    // };

    const toggleSelection = (clicked: any) => {
        let updatedIds: number[] = [];

        if (clicked.Id === 0) {
            updatedIds = [];
        } else {
            if (selectedStateIds.includes(clicked.Id)) {
                updatedIds = selectedStateIds.filter(id => id !== clicked.Id);
            } else {
                updatedIds = [...selectedStateIds, clicked.Id];
            }
        }

        const updatedOptions = updatedIds.length
            ? states.filter(s => updatedIds.includes(s.Id))
            : [];

        onStateChange(updatedIds, updatedOptions);
    };

    const isActive = (id: number) => {
        if (id === 0) return selectedStateIds.length === 0;
        return selectedStateIds.includes(id);
    };


    return (
        <div className="tab-menu multi-select-tab">
            {states.map((state) => (
                <div
                    key={state.Id}
                    className={`tab-item ${isActive(state.Id) ? "active" : ""}`}
                    onClick={() => toggleSelection(state)}
                >
                    {state.Title}
                    {(state.Count !== undefined && state.Count !== 'NaN') && ` (${state.Count})`}
                </div>
            ))}
        </div>
    );
};

export default MultiStateTabMenu;
