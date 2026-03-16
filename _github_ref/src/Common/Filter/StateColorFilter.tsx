import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';

interface StatecolorFilterProps {
    onFilterChange: (selectedValues: string[]) => void;
}

const options = [
    { label: 'NSW', color: '#1e90ff' }, // dodger blue
    { label: 'VIC', color: '#32cd32' }, // lime green
    { label: 'QLD', color: '#ff69b4' }, // hot pink
    { label: 'WA', color: '#9370db' },  // medium purple
    { label: 'SA', color: '#ffa500' },  // orange
    { label: 'TAS', color: '#20b2aa' }, // light sea green
    { label: 'ACT', color: '#dc143c' }, // crimson
];

const StatecolorFilter: React.FC<StatecolorFilterProps> = ({ onFilterChange }) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const handleSelection = (value: string) => {
        setSelectedValues(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const clearSelection = () => {
        setSelectedValues([]);
    };

    useEffect(() => {
        onFilterChange(selectedValues);
    }, [selectedValues]);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    padding: '5px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '5px',
                    backgroundColor: '#ededed'
                }}
            >
                {selectedValues.length > 0 && (
                    <button
                        onClick={clearSelection}
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
                        title="Clear all"
                    >
                        <FontAwesomeIcon icon="xmark" />
                    </button>
                )}
                {options.map((opt) => {
                    const isSelected = selectedValues.includes(opt.label);
                    return (
                        <div
                            key={opt.label}
                            onClick={() => handleSelection(opt.label)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                border: isSelected ? '1px solid #b3b1b1' : '2px solid transparent',
                                borderRadius: '15px',
                                padding: '4px 8px',
                                backgroundColor: isSelected ? 'rgb(255 255 255)' : 'transparent'
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
                    );
                })}
            </div>
        </div>
    );
};

export default StatecolorFilter;
