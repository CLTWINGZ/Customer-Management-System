import React, { useState } from 'react';
import api from '../api';

const BulkUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/customers/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Upload started! The records are being processed in the background.');
            setFile(null);
        } catch (error) {
            setMessage('Error starting upload. Please check the file format.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <h1>Bulk Data Integration</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Upload an Excel file (.xlsx) to process up to 1,000,000 customer records simultaneously.
            </p>

            <form onSubmit={handleUpload}>
                <div className="section" style={{ borderStyle: 'dashed', padding: '3rem', textAlign: 'center' }}>
                    <input 
                        type="file" 
                        accept=".xlsx" 
                        onChange={e => setFile(e.target.files[0])} 
                        id="file-upload"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {file ? file.name : 'Click to Select Excel File'}
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Supported format: .xlsx only
                        </div>
                    </label>
                </div>

                {message && (
                    <div style={{ 
                        marginTop: '1.5rem', 
                        padding: '1rem', 
                        borderRadius: '0.75rem', 
                        background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: message.includes('Error') ? 'var(--error)' : 'var(--success)',
                        border: '1px solid currentColor'
                    }}>
                        {message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={!file || uploading} 
                    style={{ marginTop: '2rem', width: '100%', height: '3.5rem', fontSize: '1.1rem' }}
                >
                    {uploading ? 'Initializing Stream...' : 'Start Bulk Import'}
                </button>
            </form>

            <div className="section" style={{ marginTop: '3rem', background: 'rgba(0,0,0,0.2)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Integration Tips:</h4>
                <ul style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
                    <li>Ensure column headers are: Name, Date of Birth, NIC.</li>
                    <li>Date format should be YYYY-MM-DD for seamless processing.</li>
                    <li>NIC numbers must be unique; duplicates will trigger profile updates.</li>
                    <li>System uses asynchronous batch processing to maintain zero downtime.</li>
                </ul>
            </div>
        </div>
    );
};

export default BulkUpload;
