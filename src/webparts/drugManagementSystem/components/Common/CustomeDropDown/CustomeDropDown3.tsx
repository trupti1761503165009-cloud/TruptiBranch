import * as React from 'react';
require('../../../assets/css/styles.css')

export interface ICustomeDropDownProps {
    option: ICustomOption[],
    onChange(item: ICustomOption): any;
    defaultValue?: any;
    placeHolder: string;
}

export interface ICustomOption {
    value: any;
    label: string
}
export const CustomeDropDown3 = (props: ICustomeDropDownProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [options, setItem] = React.useState<ICustomOption[]>(props.option);
    const [selectedOption, setSelectedOption] = React.useState<string>(!!props.defaultValue ? props.defaultValue : null);
    const dropdownRef = React.useRef<any>(null);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (option: ICustomOption) => {
        props.onChange(option)
        setSelectedOption(option.value);
        setIsOpen(false);
    };

    React.useEffect(() => {
        const handleOutsideClick = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <React.Fragment>
            <main ref={dropdownRef}>
                <button className="status" onClick={toggleDropdown}>Add Work Permit
                    {selectedOption ? options.filter((item: ICustomOption) => item.value == selectedOption)[0]?.label : props.placeHolder}</button>
                {isOpen && (
                    <ul>
                        {options.map((option: ICustomOption) => (
                            <li key={option.value} onClick={() => handleSelect(option)} className={`dropdown-item ${option.value === selectedOption ? 'active' : ""}`}>
                                {option.label}
                                {option.value === selectedOption &&
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.5 17L4.5 12" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M19.5 7L9.5 17" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                }
                            </li>
                        ))}
                    </ul>
                )}
            </main>

        </React.Fragment>
    );


}