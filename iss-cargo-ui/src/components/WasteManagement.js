import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WasteManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/items');
      setItems(response.data.items.filter(item => item.status !== 'waste'));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const markAsWaste = async (itemId) => {
    try {
      await axios.post(`http://localhost:8000/api/items/waste/${itemId}`);
      setMessage('Item marked as waste successfully');
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark item as waste');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Waste Management</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}

      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedItem?.id || ''}
          onChange={(e) => {
            const item = items.find(i => i.id === parseInt(e.target.value));
            setSelectedItem(item);
          }}
          style={{ padding: '8px', minWidth: '300px' }}
        >
          <option value="">Select an item to mark as waste</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.id}) - {item.status}
            </option>
          ))}
        </select>

        <button
          onClick={() => selectedItem && markAsWaste(selectedItem.id)}
          disabled={!selectedItem}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            marginLeft: '10px'
          }}
        >
          Mark as Waste
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <h3>Items Marked as Waste</h3>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Container</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(item => item.status === 'waste').map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.status}</td>
                <td>{item.container_id || 'None'}</td>
                <td>{item.expiry_date || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WasteManagement;
