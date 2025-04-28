import React, { useState } from 'react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/import/items', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to import items');
      }

      const data = await response.json();
      setImportStatus({
        type: 'success',
        message: data.message
      });
      fetchItems(); // Refresh the items list
    } catch (err) {
      console.error('Upload error:', err);
      setImportStatus({
        type: 'error',
        message: err.message || 'Error uploading file'
      });
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Inventory</h2>
        <div style={styles.buttonGroup}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            ref={input => setFileInput(input)}
          />
          <button
            style={styles.importButton}
            onClick={() => fileInput && fileInput.click()}
            disabled={loading}
          >
            Import CSV
          </button>
          <button
            style={styles.addButton}
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            Add Item
          </button>
        </div>
      </div>

      {importStatus && (
        <div style={{
          ...styles.alert,
          backgroundColor: importStatus.type === 'success' ? '#4caf50' : '#f44336'
        }}>
          {importStatus.message}
        </div>
      )}

      {/* ... rest of the existing JSX ... */}
    </div>
  );
};

const styles = {
  // ... existing styles ...
  importButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '14px',
  },
  alert: {
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    color: 'white',
    textAlign: 'center',
  },
  // ... rest of the existing styles ...
};

export default Inventory; 