import React, { useState, ChangeEvent } from 'react';
import { DialogConfirmationComponent } from './DialogConfirmationComponent';
import { TextField } from '@fluentui/react';

interface AutoCompleteProps {
    type: string;
    option: any;
    onOptionSelect: (value: string, type: string) => void;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({ type, onOptionSelect, option }) => {
    const [options, setOptions] = useState<string[]>(option);
    const [inputValue, setInputValue] = useState<string>('');
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(true);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || value === undefined) {
            onOptionSelect("", type);
        }
        setInputValue(value);

        if (value.trim() === '') {
            setFilteredOptions([]);
            return;
        }

        const filtered = options.filter(option =>
            option.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    const handleSelectOption = (option: string) => {
        setInputValue(option);
        setFilteredOptions([]);
        onOptionSelect(option, type); // callback with selected option
    };

    const handleAddOption = () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;
        setIsDialogOpen(false);
    };

    const handleConfirmAdd = () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        setOptions(prev => [...prev, trimmedInput]);
        setFilteredOptions([]);
        setIsDialogOpen(true);
        onOptionSelect(trimmedInput, type); // callback with new option
    };

    const showAddOption =
        inputValue.trim() &&
        !options.some(opt => opt.toLowerCase() === inputValue.trim().toLowerCase());

    return (
        <div style={{ fontFamily: 'Arial', position: 'relative' }}>
            {!isDialogOpen && (
                <DialogConfirmationComponent
                    message={'Are you sure to add this option?'}
                    hideDialog={isDialogOpen}
                    toggleHideDialog={() => setIsDialogOpen(true)}
                    dialogHeader={'Add New Option'}
                    yesText={'Yes'}
                    noText={'No'}
                    yesClick={handleConfirmAdd}
                />
            )}
            {/* <input
                type="text"
                className="formControl"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={type}
                style={{
                    width: '238px',
                    padding: '10px',
                    fontSize: '16px',
                    height: '39px'
                }}
            /> */}
            <TextField className="formControl"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={type}
            />
            {inputValue && (
                (!!filteredOptions && filteredOptions.length > 0) && <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        width: '238px',
                        marginTop: '-12px',
                        border: '1px solid #ccc',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        position: 'absolute',
                        zIndex: 10000
                    }}
                >
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelectOption(option)}
                            style={{
                                padding: '5px 10px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer'
                            }}
                        >
                            {option}
                        </li>
                    ))}
                    {/* {showAddOption && (
                        <li
                            onClick={handleAddOption}
                            style={{
                                padding: '10px',
                                fontWeight: 'bold',
                                color: 'green',
                                cursor: 'pointer'
                            }}
                        >
                            Add "{inputValue.trim()}"
                        </li>
                    )} */}
                </ul>
            )}
        </div>
    );
};

export default AutoComplete;
