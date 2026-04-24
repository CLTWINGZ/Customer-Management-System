import React, { useEffect, useState } from 'react';
import api from '../api';

const CustomerForm = ({ customerId, onSave, onCancel }) => {
    const initialFormState = {
        name: '',
        dob: '',
        nic: '',
        mobiles: [''],
        addresses: [{ addressLine1: '', addressLine2: '', cityId: '', countryId: '' }],
        familyMemberIds: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState({});
    const [allCustomers, setAllCustomers] = useState([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            const countryRes = await api.get('/customers/countries');
            setCountries(countryRes.data);
            
            const customerRes = await api.get('/customers?size=1000');
            setAllCustomers(customerRes.data.content);
        };
        fetchMasterData();

        if (customerId) {
            const fetchCustomer = async () => {
                const res = await api.get(`/customers/${customerId}`);
                const data = res.data;
                
                // Ensure at least one empty mobile/address if none exist
                if (!data.mobiles || data.mobiles.length === 0) data.mobiles = [''];
                if (!data.addresses || data.addresses.length === 0) {
                    data.addresses = [{ addressLine1: '', addressLine2: '', cityId: '', countryId: '' }];
                }
                
                setFormData(data);
                
                // Fetch cities for all existing address countries
                const uniqueCountryIds = [...new Set(data.addresses.map(a => a.countryId).filter(id => id))];
                for (const countryId of uniqueCountryIds) {
                    const cityRes = await api.get(`/customers/cities?countryId=${countryId}`);
                    setCities(prev => ({ ...prev, [countryId]: cityRes.data }));
                }
            };
            fetchCustomer();
        } else {
            setFormData(initialFormState);
        }
    }, [customerId]);

    const handleCountryChange = async (index, countryId) => {
        if (countryId && !cities[countryId]) {
            const res = await api.get(`/customers/cities?countryId=${countryId}`);
            setCities(prev => ({ ...prev, [countryId]: res.data }));
        }
        
        const newAddresses = [...formData.addresses];
        newAddresses[index] = { ...newAddresses[index], countryId, cityId: '' };
        setFormData({ ...formData, addresses: newAddresses });
    };

    const handleAddMobile = () => setFormData({ ...formData, mobiles: [...formData.mobiles, ''] });
    const handleAddAddress = () => setFormData({ ...formData, addresses: [...formData.addresses, { addressLine1: '', addressLine2: '', cityId: '', countryId: '' }] });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedData = {
            ...formData,
            mobiles: formData.mobiles.filter(m => m && m.trim() !== ''),
            addresses: formData.addresses
                .filter(addr => addr.cityId && addr.cityId !== '')
                .map(({ countryId, cityName, countryName, ...rest }) => rest)
        };

        try {
            if (customerId) {
                await api.put(`/customers/${customerId}`, cleanedData);
            } else {
                await api.post('/customers', cleanedData);
            }
            onSave();
        } catch (error) {
            console.error(error);
            alert("Error saving customer. Check NIC uniqueness or mandatory fields.");
        }
    };

    return (
        <div className="card">
            <h1>{customerId ? 'Update Profile' : 'New Registration'}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please provide the required details below for the customer profile.</p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="John Silva" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>NIC Number</label>
                        <input type="text" placeholder="199012345678" value={formData.nic || ''} onChange={e => setFormData({ ...formData, nic: e.target.value })} required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" value={formData.dob || ''} onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
                </div>

                <div className="section">
                    <h3>Contact Numbers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {formData.mobiles.map((m, i) => (
                            <input key={i} type="tel" placeholder="0712345678" value={m || ''} onChange={e => {
                                const newM = [...formData.mobiles];
                                newM[i] = e.target.value;
                                setFormData({ ...formData, mobiles: newM });
                            }} />
                        ))}
                    </div>
                    <button type="button" className="secondary" style={{ marginTop: '1rem' }} onClick={handleAddMobile}>+ Add Another Number</button>
                </div>

                <div className="section">
                    <h3>Address Details</h3>
                    {formData.addresses.length === 0 && <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No addresses added yet.</p>}
                    {formData.addresses.map((addr, i) => (
                        <div key={i} className="address-block">
                            <input placeholder="Address Line 1" value={addr.addressLine1 || ''} onChange={e => {
                                const newA = [...formData.addresses];
                                newA[i] = { ...newA[i], addressLine1: e.target.value };
                                setFormData({ ...formData, addresses: newA });
                            }} />
                            <input placeholder="Address Line 2" value={addr.addressLine2 || ''} onChange={e => {
                                const newA = [...formData.addresses];
                                newA[i] = { ...newA[i], addressLine2: e.target.value };
                                setFormData({ ...formData, addresses: newA });
                            }} />
                            <select value={addr.countryId || ''} onChange={e => handleCountryChange(i, e.target.value)}>
                                <option value="">Select Country</option>
                                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select 
                                value={addr.cityId || ''} 
                                onChange={e => {
                                    const newA = [...formData.addresses];
                                    newA[i] = { ...newA[i], cityId: e.target.value };
                                    setFormData({ ...formData, addresses: newA });
                                }}
                                disabled={!addr.countryId}
                            >
                                <option value="">Select City</option>
                                {(cities[addr.countryId] || []).map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                            </select>
                        </div>
                    ))}
                    <button type="button" className="secondary" onClick={handleAddAddress}>+ Add Another Address</button>
                </div>

                <div className="section">
                    <h3>Family Connections</h3>
                    <select multiple style={{ height: '120px' }} value={formData.familyMemberIds || []} onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData({ ...formData, familyMemberIds: values });
                    }}>
                        {allCustomers.filter(c => c.id !== customerId).map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.nic})</option>
                        ))}
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hold Ctrl/Cmd to select multiple members.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                    <button type="submit" style={{ flex: 1 }}>Save Profile</button>
                    <button type="button" className="secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
