import React, { useEffect, useState } from 'react';

interface WorkWindowFilterProps {
    data: any[];
    onFilterChange: (selectedWorkWindows: string[]) => void;
}

const WorkWindowFilter: React.FC<WorkWindowFilterProps> = ({ data, onFilterChange }) => {
    const [selectedWorkWindows, setSelectedWorkWindows] = useState<string[]>([]);

    const uniqueWorkWindows = Array.from(
        new Set(data.map(item => item.work_Window))
    )
        .filter(x => x != null)
        .sort((a, b) => a.localeCompare(b));

    const handleCheckboxChange = (workWindow: string) => {
        setSelectedWorkWindows(prev =>
            prev.includes(workWindow)
                ? prev.filter(w => w !== workWindow)
                : [...prev, workWindow]
        );
    };

    useEffect(() => {
        onFilterChange(selectedWorkWindows);
    }, [selectedWorkWindows]);

    return (
        <div style={{ marginBottom: '12px' }}>
            <strong>Work Window</strong>
            {uniqueWorkWindows.map(workWindow => (
                <div key={workWindow}>
                    <input
                        type="checkbox"
                        id={`workWindow-${workWindow}`}
                        checked={selectedWorkWindows.includes(workWindow)}
                        onChange={() => handleCheckboxChange(workWindow)}
                    />
                    <label htmlFor={`workWindow-${workWindow}`}>{workWindow}</label>
                </div>
            ))}
        </div>
    );
};

export default WorkWindowFilter;
