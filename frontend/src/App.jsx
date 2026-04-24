import React, { useState } from 'react';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import BulkUpload from './components/BulkUpload';
import './App.css';

function App() {
    const [view, setView] = useState('list'); // 'list', 'form', 'bulk'
    const [editingId, setEditingId] = useState(null);

    const showForm = (id = null) => {
        setEditingId(id);
        setView('form');
    };

    const showList = () => {
        setView('list');
    };

    return (
        <div className="App">
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>🛡️</div>
                    <h2 style={{ margin: 0, background: 'none', WebkitTextFillColor: 'initial', color: 'white' }}>
                        CustomerOS <span style={{ color: 'var(--primary)', fontWeight: 300 }}>v1.0</span>
                    </h2>
                </div>
                
                <nav>
                    <a href="#" className={view === 'list' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setView('list'); }}>Directory</a>
                    <a href="#" className={view === 'form' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setEditingId(null); setView('form'); }}>Registration</a>
                    <a href="#" className={view === 'bulk' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setView('bulk'); }}>Bulk Import</a>
                </nav>
            </header>

            <main>
                {view === 'list' && <CustomerList onEdit={showForm} />}
                {view === 'form' && <CustomerForm customerId={editingId} onSave={showList} onCancel={showList} />}
                {view === 'bulk' && <BulkUpload />}
            </main>

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                &copy; 2026 Customer Management System. Built for Sri Lanka operations.
            </footer>
        </div>
    );
}

export default App;
