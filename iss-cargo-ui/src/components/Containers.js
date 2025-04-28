import React, { useState } from 'react';

const Containers = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/import/containers', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to import containers');
      }

      const data = await response.json();
      setImportStatus({
        type: 'success',
        message: data.message
      });
      fetchContainers(); // Refresh the containers list
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
        <h2 style={styles.title}>Containers</h2>
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
            Add Container
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
  container: {
    padding: '20px',
    backgroundColor: '#1a1a2e',
    minHeight: '100vh',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#fff',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  importButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  addButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
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

export default Containers; 