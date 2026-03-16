import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
interface ShiftNonShiftCheckFilterProps {
    onFilterChange: (selectedValues: string[]) => void;
}

const options = [
    { label: 'Non-Shiftworker', color: '#4a90e2' }, // blue
    { label: 'Shiftworker', color: '#50e3c2' },    // green
];

const ShiftNonShiftCheckFilter: React.FC<ShiftNonShiftCheckFilterProps> = ({ onFilterChange }) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const handleSelection = (value: string) => {
        setSelectedValues(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const clearAll = () => {
        setSelectedValues([]);
    };

    useEffect(() => {
        onFilterChange(selectedValues);
    }, [selectedValues]);

    return (
        <div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', padding: '5px', border: '1px solid #dbdbdb', borderRadius: '5px', backgroundColor: '#ededed' }}>
                {selectedValues.length > 0 && (
                    <button
                        onClick={clearAll}
                        style={{
                            background: 'transparent',
                            border: '1px solid #bfbfbf',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                        title="Clear"
                    >
                        <FontAwesomeIcon icon="xmark" />
                    </button>
                )}
                {options.map((opt) => (
                    <div
                        key={opt.label}
                        onClick={() => handleSelection(opt.label)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            border: selectedValues.includes(opt.label) ? '1px solid #b3b1b1' : '2px solid transparent',
                            backgroundColor: selectedValues.includes(opt.label) ? 'rgb(255 255 255)' : 'transparent',
                            borderRadius: '15px',
                            padding: '4px 8px',
                        }}
                    >
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: opt.color,
                                borderRadius: '2px',
                                marginRight: '6px',
                            }}
                        />
                        <span>{opt.label}</span>
                    </div>
                ))}


            </div>
        </div>
    );
};

export default ShiftNonShiftCheckFilter;
