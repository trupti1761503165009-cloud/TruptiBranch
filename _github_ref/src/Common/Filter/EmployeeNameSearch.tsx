import React, { useState } from 'react';

interface DataItem {
    client_Business: string | null;
    job_Title2: string;
    employee_Name: string;
}

interface Props {
    data: DataItem[];
    // onSearchResults: (filteredResults: DataItem[]) => void;
    onSearchResults: (any: string) => void;
}

const EmployeeNameSearch: React.FC<Props> = ({ data, onSearchResults }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const filtered = data.filter(item =>
            item.employee_Name.toLowerCase().includes(term.toLowerCase())
        );
        onSearchResults(term);
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by employee name"
                style={{
                    width: '300px',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    height: "40px"
                }}
            />
        </div>
    );
};

export default EmployeeNameSearch;
