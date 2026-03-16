import React, { useState, useEffect } from 'react';

interface WeekFilterProps {
    data: { week: number }[];
    onFilterChange: (selectedWeeks: number[]) => void;
}

const WeekFilter: React.FC<WeekFilterProps> = ({ data, onFilterChange }) => {
    const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

    const uniqueWeeks = Array.from(new Set(data.map(item => item.week))).sort((a, b) => a - b);

    const handleCheckboxChange = (week: number) => {
        setSelectedWeeks(prev =>
            prev.includes(week)
                ? prev.filter(w => w !== week)
                : [...prev, week]
        );
    };

    useEffect(() => {
        onFilterChange(selectedWeeks);
    }, [selectedWeeks, onFilterChange]);

    return (
        <div className='week-filter-height' style={{ marginBottom: '12px' }}>
            <strong>Week</strong>
            {uniqueWeeks.map(week => (
                <div key={week}>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedWeeks.includes(week)}
                            onChange={() => handleCheckboxChange(week)}
                        />
                        Week {week}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default WeekFilter;
