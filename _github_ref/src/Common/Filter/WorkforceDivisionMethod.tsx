import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

interface FilterItem {
    label: string;
    value: string;
    color: string;
}

interface MultiSelectFilterProps {
    items: FilterItem[];
    onChange: (selected: string[]) => void;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({ items, onChange }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelection = (value: string) => {
        const isSelected = selected.includes(value);
        const updated = isSelected
            ? selected.filter(v => v !== value)
            : [...selected, value];
        setSelected(updated);
        onChange(updated);
    };

    const clearAll = () => {
        setSelected([]);
        onChange([]);
    };

    return (
        <div className='mb-10 mt-10'>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', padding: '5px', border: '1px solid #dbdbdb', borderRadius: '5px', backgroundColor: '#ededed' }}>
                {selected.length > 0 && (
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
                {items.map(item => (
                    <div
                        key={item.value}
                        onClick={() => toggleSelection(item.value)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            border: selected.includes(item.value) ? '1px solid #b3b1b1' : '2px solid transparent',
                            backgroundColor: selected.includes(item.value) ? 'rgb(255 255 255)' : 'transparent',
                            borderRadius: '15px',
                            padding: '4px 8px',
                        }}
                    >
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: item.color,
                                borderRadius: '2px',
                                marginRight: '6px',
                            }}
                        />
                        <span>{item.label}</span>
                    </div>
                ))}


            </div>
        </div>
    );
};

export default MultiSelectFilter;
