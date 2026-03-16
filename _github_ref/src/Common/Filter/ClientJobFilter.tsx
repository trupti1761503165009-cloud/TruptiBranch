import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useRef } from 'react';

interface DataItem {
    client_Business: string | null;
    job_Title2: string;
}

interface Props {
    data: DataItem[];
    onFilterChange: (selectedJobTitles: string[]) => void;
}

const ClientJobFilterDropdown: React.FC<Props> = ({ data, onFilterChange }) => {
    const [expandedClients, setExpandedClients] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [allSelected, setAllSelected] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);  // <-- ref here

    const groupedData = data.reduce((acc, item) => {
        const client = item.client_Business || 'Unknown Client';
        if (!acc[client]) acc[client] = new Set<string>();
        acc[client].add(item.job_Title2);
        return acc;
    }, {} as Record<string, Set<string>>);

    const allClients = Object.keys(groupedData);
    const allJobs = Array.from(new Set(data.map(item => item.job_Title2)));

    useEffect(() => {
        const combinedSelectedJobs = Array.from(new Set([
            ...selectedJobs,
            ...selectedClients.flatMap(client => Array.from(groupedData[client] || []))
        ]));
        onFilterChange(combinedSelectedJobs);
    }, [selectedClients, selectedJobs]);

    useEffect(() => {
        if (selectedClients.length > 0 && selectedJobs.length > 0) {
            const allClientsSelected = selectedClients.length === allClients.length;
            const allJobsSelected = selectedJobs.length === allJobs.length;
            setAllSelected(allClientsSelected && allJobsSelected);
        }
    }, [selectedClients, selectedJobs]);

    // Close dropdown if click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Rest of your handlers (handleClientToggle, handleClientSelect, handleJobSelect, handleAllSelect) ...

    // ... (keep your existing handler implementations unchanged)

    const handleClientToggle = (client: string) => {
        setExpandedClients(prev =>
            prev.includes(client)
                ? prev.filter(c => c !== client)
                : [...prev, client]
        );
    };

    const handleClientSelect = (client: string) => {
        const clientJobs = Array.from(groupedData[client] || []);
        const isClientSelected = selectedClients.includes(client);

        if (isClientSelected) {
            setSelectedClients(prev => prev.filter(c => c !== client));
            setSelectedJobs(prev => prev.filter(j => !clientJobs.includes(j)));
        } else {
            setSelectedClients(prev => [...prev, client]);
            setSelectedJobs(prev => Array.from(new Set([...prev, ...clientJobs])));
        }
    };

    const handleJobSelect = (client: string, jobTitle: string) => {
        const isJobSelected = selectedJobs.includes(jobTitle);

        if (isJobSelected) {
            setSelectedJobs(prev => prev.filter(j => j !== jobTitle));

            const clientJobs = Array.from(groupedData[client] || []);
            const remainingJobs = clientJobs.filter(j => j !== jobTitle);
            const allRemainingSelected = remainingJobs.every(j => selectedJobs.includes(j));
            if (!allRemainingSelected) {
                setSelectedClients(prev => prev.filter(c => c !== client));
            }
        } else {
            const updatedJobs = [...selectedJobs, jobTitle];
            setSelectedJobs(updatedJobs);

            const clientJobs = Array.from(groupedData[client] || []);
            const allNowSelected = clientJobs.every(j => updatedJobs.includes(j));
            if (allNowSelected) {
                setSelectedClients(prev =>
                    prev.includes(client) ? prev : [...prev, client]
                );
            }
        }
    };

    const handleAllSelect = () => {
        if (allSelected) {
            setSelectedClients([]);
            setSelectedJobs([]);
            setAllSelected(false);
        } else {
            setSelectedClients(allClients);
            setSelectedJobs(allJobs);
            setAllSelected(true);
        }
    };

    const filteredGroupedData = Object.entries(groupedData).reduce((acc, [client, jobs]) => {
        const filteredJobs = Array.from(jobs).filter(job =>
            job.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredJobs.length > 0) {
            acc[client] = new Set(filteredJobs);
        }
        return acc;
    }, {} as Record<string, Set<string>>);

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: '300px' }} ref={dropdownRef}>
            <div
                onClick={() => setDropdownOpen(prev => !prev)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: '#fff',
                    cursor: 'pointer',
                    height: "40px"
                }}
            >
                <span style={{ color: selectedClients.length || selectedJobs.length ? '#000' : '#888' }}>
                    {allSelected
                        ? 'All Selected'
                        : `${selectedClients.length} client(s), ${selectedJobs.length} job(s) selected`}
                </span>
                <span style={{ color: '#888' }}>
                    {dropdownOpen ? <FontAwesomeIcon icon="caret-down" /> : <FontAwesomeIcon icon="caret-right" />}
                </span>
            </div>

            {dropdownOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    maxHeight: '350px',
                    overflowY: 'auto',
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    padding: '8px'
                }}>
                    {/* Search Box */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by client or job title"
                        style={{
                            width: '100%',
                            marginBottom: '10px',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />

                    {/* All Option */}
                    <div style={{ marginBottom: '8px' }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={handleAllSelect}
                            style={{ marginRight: '5px' }}
                        />
                        <strong>All</strong>
                    </div>

                    {/* Client + Jobs */}
                    {Object.entries(filteredGroupedData).sort().map(([client, jobSet]) => {
                        const jobs = Array.from(jobSet).sort();
                        return (
                            <div key={client} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span
                                        onClick={() => handleClientToggle(client)}
                                        style={{ cursor: 'pointer', marginRight: '5px' }}
                                    >
                                        {expandedClients.includes(client)
                                            ? <FontAwesomeIcon icon="caret-down" />
                                            : <FontAwesomeIcon icon="caret-right" />}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.includes(client)}
                                        onChange={() => handleClientSelect(client)}
                                        style={{ marginRight: '5px' }}
                                    />
                                    <span>{client}</span>
                                </div>

                                {expandedClients.includes(client) && (
                                    <div style={{ marginLeft: '24px', marginTop: '4px' }}>
                                        {jobs.map(job => (
                                            <div key={job} style={{ marginBottom: '4px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedJobs.includes(job)}
                                                    onChange={() => handleJobSelect(client, job)}
                                                    style={{ marginRight: '5px' }}
                                                />
                                                <span>{job}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClientJobFilterDropdown;
