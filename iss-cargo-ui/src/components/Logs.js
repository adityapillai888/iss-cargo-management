import React, { useState, useEffect } from 'react';
import axios from 'axios';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/logs');
      setLogs(response.data.logs);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filterLogs = () => {
    return logs.filter(log => {
      const matchesSearch = 
        !searchQuery || 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDate = 
        !dateRange.startDate || 
        new Date(log.timestamp) >= dateRange.startDate;

      return matchesSearch && matchesDate;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>System Logs</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            flex: 1,
            minWidth: '200px'
          }}
        />

        <input
          type="date"
          value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            setDateRange(prev => ({
              ...prev,
              startDate: e.target.value ? new Date(e.target.value) : null
            }));
          }}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <input
          type="date"
          value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            setDateRange(prev => ({
              ...prev,
              endDate: e.target.value ? new Date(e.target.value) : null
            }));
          }}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button
          onClick={fetchLogs}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>Timestamp</th>
              <th style={{ minWidth: '100px' }}>Action</th>
              <th style={{ minWidth: '100px' }}>Item ID</th>
              <th style={{ minWidth: '100px' }}>Container ID</th>
              <th style={{ minWidth: '200px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filterLogs().map(log => (
              <tr key={log.id} style={{
                backgroundColor: log.action.includes('error') ? '#ffebee' : 'white'
              }}>
                <td>{formatTimestamp(log.timestamp)}</td>
                <td>{log.action}</td>
                <td>{log.item_id || 'N/A'}</td>
                <td>{log.container_id || 'N/A'}</td>
                <td>{log.details || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
