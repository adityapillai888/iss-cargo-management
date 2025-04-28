import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Placement = () => {
  const [items, setItems] = useState([]);
  const [containers, setContainers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchContainers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/items');
      setItems(response.data.items.filter(item => item.status === 'available'));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/containers');
      setContainers(response.data.containers);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePlaceItem = async () => {
    if (!selectedItem || !selectedContainer) {
      setError('Please select both an item and a container');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/items/place', {
        item_id: selectedItem.id,
        container_id: selectedContainer.container_id
      });

      setMessage('Item placed successfully');
      setSelectedItem(null);
      setSelectedContainer(null);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place item');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Item Placement</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <select
          value={selectedItem?.id || ''}
          onChange={(e) => {
            const item = items.find(i => i.id === parseInt(e.target.value));
            setSelectedItem(item);
          }}
          style={{ padding: '8px', minWidth: '200px' }}
        >
          <option value="">Select an item</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.id})
            </option>
          ))}
        </select>

        <select
          value={selectedContainer?.container_id || ''}
          onChange={(e) => {
            const container = containers.find(c => c.container_id === e.target.value);
            setSelectedContainer(container);
          }}
          style={{ padding: '8px', minWidth: '200px' }}
        >
          <option value="">Select a container</option>
          {containers.map(container => (
            <option key={container.container_id} value={container.container_id}>
              {container.name} ({container.container_id})
            </option>
          ))}
        </select>

        <button
          onClick={handlePlaceItem}
          disabled={!selectedItem || !selectedContainer}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Place Item
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
          <h3>Available Items</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Dimensions (cm)</th>
                <th>Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: selectedItem?.id === item.id ? '#f0f0f0' : 'white'
                  }}
                >
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    {item.width} x {item.height} x {item.depth}
                  </td>
                  <td>{item.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
          <h3>Containers</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Zone</th>
                <th>Dimensions (cm)</th>
                <th>Current Load (kg)</th>
              </tr>
            </thead>
            <tbody>
              {containers.map(container => (
                <tr
                  key={container.container_id}
                  style={{
                    backgroundColor: selectedContainer?.container_id === container.container_id ? '#f0f0f0' : 'white'
                  }}
                >
                  <td>{container.container_id}</td>
                  <td>{container.name}</td>
                  <td>{container.zone}</td>
                  <td>
                    {container.width_cm} x {container.depth_cm} x {container.height_cm}
                  </td>
                  <td>{container.current_load}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Placement;
