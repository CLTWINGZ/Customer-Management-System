import React, { useEffect, useState } from 'react';
import api from '../api';

const CustomerList = ({ onEdit }) => {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState('');

    const fetchCustomers = async () => {
        try {
            const response = await api.get(`/customers?query=${query}&page=${page}&size=10`);
            setCustomers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching customers", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [page, query]);

    return (
        <div className="card">
            <h1>Customer Directory</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your customers and their relationships efficiently.</p>
            
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                        type="text" 
                        placeholder="Search by Name or NIC..." 
                        value={query} 
                        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    {query && (
                        <button 
                            className="secondary" 
                            onClick={() => setQuery('')}
                            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.25rem 0.5rem', height: 'auto' }}
                        >✕</button>
                    )}
                </div>
            </div>
            
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>DOB</th>
                            <th>NIC</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                <td>{c.dob}</td>
                                <td style={{ fontFamily: 'monospace' }}>{c.nic}</td>
                                <td>
                                    {c.addresses && c.addresses.length > 0 ? (
                                        <span>
                                            {c.addresses[0].cityName}
                                            {c.addresses.length > 1 && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '0.5rem' }}>
                                                    (+{c.addresses.length - 1} more)
                                                </span>
                                            )}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="secondary" onClick={() => onEdit(c.id)}>Edit</button>
                                        <button onClick={() => onEdit(c.id)}>View</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {page > 2 && (
                        <>
                            <button className="secondary" onClick={() => setPage(0)}>1</button>
                            {page > 3 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                        </>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i)
                        .filter(i => i >= page - 2 && i <= page + 2)
                        .map(i => (
                            <button 
                                key={i} 
                                className={page === i ? 'primary' : 'secondary'}
                                onClick={() => setPage(i)}
                                style={{ minWidth: '2.5rem' }}
                            >
                                {i + 1}
                            </button>
                        ))
                    }

                    {page < totalPages - 3 && (
                        <>
                            {page < totalPages - 4 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                            <button className="secondary" onClick={() => setPage(totalPages - 1)}>{totalPages}</button>
                        </>
                    )}
                </div>

                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </div>
    );
};

export default CustomerList;
