import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Retrieval = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [retrievalInfo, setRetrievalInfo] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/items');
      setItems(response.data.items.filter(item => item.status === 'placed'));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchRetrievalInfo = async (itemId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/items/retrieval_info?item_id=${itemId}`);
      setRetrievalInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch retrieval information');
    }
  };

  const handleRetrieveItem = async () => {
    if (!selectedItem) {
      setError('Please select an item to retrieve');
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/items/retrieve?item_id=${selectedItem.id}`);
      setMessage('Item retrieved successfully');
      setSelectedItem(null);
      setRetrievalInfo(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to retrieve item');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Item Retrieval</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}

      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedItem?.id || ''}
          onChange={(e) => {
            const item = items.find(i => i.id === parseInt(e.target.value));
            setSelectedItem(item);
            if (item) fetchRetrievalInfo(item.id);
          }}
          style={{ padding: '8px', minWidth: '300px' }}
        >
          <option value="">Select an item to retrieve</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.id}) - {item.container_id}
            </option>
          ))}
        </select>

        <button
          onClick={handleRetrieveItem}
          disabled={!selectedItem}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            marginLeft: '10px'
          }}
        >
          Retrieve Item
        </button>
      </div>

      {retrievalInfo && (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Retrieval Information</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Item ID:</strong> {retrievalInfo.item_id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Container:</strong> {retrievalInfo.container_id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Position:</strong> ({retrievalInfo.position.x}, {retrievalInfo.position.y}, {retrievalInfo.position.z})
          </div>
          {retrievalInfo.blocking_items && retrievalInfo.blocking_items.length > 0 && (
            <div>
              <strong>Blocking Items:</strong>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {retrievalInfo.blocking_items.map(item => (
                  <li key={item.id}>{item.name} ({item.id})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <h3>Placed Items</h3>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Container</th>
              <th>Position</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.container_id}</td>
                <td>
                  ({item.x}, {item.y}, {item.z})
                </td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Retrieval;
