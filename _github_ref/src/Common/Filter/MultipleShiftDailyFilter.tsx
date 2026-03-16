import React, { useEffect, useState } from 'react';

interface MultipleShiftDailyFilterProps {
    data: any[];
    onFilterChange: (selectedValues: string[]) => void;
}

const MultipleShiftDailyFilter: React.FC<MultipleShiftDailyFilterProps> = ({ data, onFilterChange }) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const uniqueValues = Array.from(
        new Set(data.map(item => item.multiple_Shift_Daily))
    )
        .filter(x => x != null)
        .sort((a, b) => a.localeCompare(b));

    const handleCheckboxChange = (value: string) => {
        setSelectedValues(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    useEffect(() => {
        onFilterChange(selectedValues);
    }, [selectedValues]);

    return (
        <div style={{ marginBottom: '12px' }}>
            <strong>Multiple Shift Daily</strong>
            {uniqueValues.map(value => (
                <div key={value}>
                    <input
                        type="checkbox"
                        id={`multipleShift-${value}`}
                        checked={selectedValues.includes(value)}
                        onChange={() => handleCheckboxChange(value)}
                    />
                    <label htmlFor={`multipleShift-${value}`}>{value}</label>
                </div>
            ))}
        </div>
    );
};

export default MultipleShiftDailyFilter;
