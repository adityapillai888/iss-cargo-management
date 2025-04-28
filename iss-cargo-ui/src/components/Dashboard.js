import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import apiService from '../services/apiService';

const styles = {
  dashboardContainer: {
    padding: '2rem',
    backgroundColor: '#1a1a2e',
    minHeight: '100vh',
    color: '#fff',
    position: 'relative',
    zIndex: 1,
  },
  dashboardBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/space-bg.webp")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.25,
    zIndex: -1,
  },
  navTabs: {
    borderBottom: '2px solid #16213e',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  navLink: {
    color: '#e94560',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    marginRight: '4px'
  },
  navLinkHover: {
    color: '#fff',
    backgroundColor: 'rgba(233, 69, 96, 0.1)'
  },
  navLinkActive: {
    color: '#fff',
    backgroundColor: '#e94560',
    boxShadow: '0 0 20px rgba(233, 69, 96, 0.3)'
  },
  card: {
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
    backgroundColor: '#16213e',
    backdropFilter: 'blur(10px)',
    borderStyle: '1px solid rgba(255, 255, 255, 0.1)'
  },
  cardHover: {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 40px rgba(233, 69, 96, 0.2)'
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 600,
    marginBottom: '1.5rem',
    fontSize: '1.5rem'
  },
  table: {
    marginBottom: 0,
    color: '#fff',
    backgroundColor: '#1f2937'
  },
  tableHeader: {
    borderTop: 'none',
    backgroundColor: '#1f2937',
    color: '#e94560',
    fontWeight: 600,
    borderBottom: '2px solid #e94560'
  },
  tableCell: {
    verticalAlign: 'middle',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1f2937',
    color: '#fff'
  },
  button: {
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  buttonPrimary: {
    backgroundColor: '#e94560',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)'
  },
  buttonPrimaryHover: {
    backgroundColor: '#ff6b81',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(233, 69, 96, 0.4)'
  },
  buttonDanger: {
    backgroundColor: '#ff4757',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)'
  },
  buttonDangerHover: {
    backgroundColor: '#ff6b81',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 71, 87, 0.4)'
  },
  formControl: {
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1rem',
    transition: 'all 0.3s ease',
    backgroundColor: '#1a1a2e',
    color: '#fff'
  },
  formControlFocus: {
    borderColor: '#e94560',
    boxShadow: '0 0 0 0.25rem rgba(233, 69, 96, 0.25)'
  },
  alert: {
    borderRadius: '15px',
    border: 'none',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)'
  },
  display4: {
    color: '#e94560',
    fontWeight: 700,
    fontSize: '3.5rem',
    textShadow: '0 0 20px rgba(233, 69, 96, 0.3)'
  },
  statLabel: {
    color: '#fff',
    fontSize: '1.2rem',
    opacity: 0.8
  },
  formLabel: {
    color: '#fff',
    fontWeight: 500,
    marginBottom: '0.5rem'
  },
  loadingSpinner: {
    width: '3rem',
    height: '3rem',
    color: '#e94560'
  },
  cardBody: {
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  importButton: {
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)',
    ':hover': {
      backgroundColor: '#ff6b81',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(233, 69, 96, 0.4)'
    }
  },
  addButton: {
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)',
    ':hover': {
      backgroundColor: '#ff6b81',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(233, 69, 96, 0.4)'
    }
  },
  floatingButton: {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    width: 'auto',
    minWidth: '300px',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    borderRadius: '50px',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#ff6b81',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
    }
  },
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inventory, setInventory] = useState([]);
  const [containers, setContainers] = useState([]);
  const [wasteItems, setWasteItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [fastForwardDays, setFastForwardDays] = useState(1);
  const [formData, setFormData] = useState({
    itemId: '',
    containerId: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredContainer, setHoveredContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [formStatus, setFormStatus] = useState({
    isValid: false,
    message: ''
  });
  const [sortOption, setSortOption] = useState('none');
  const [fileInput, setFileInput] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [containersPage, setContainersPage] = useState(1);
  const [itemsPlacementPage, setItemsPlacementPage] = useState(1);
  const [containersPlacementPage, setContainersPlacementPage] = useState(1);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [containerSearchQuery, setContainerSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 100;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [inventoryData, containersData, wasteData, logsData, dateData] = await Promise.all([
        apiService.getInventory(),
        apiService.getContainers(),
        apiService.getWasteItems(),
        apiService.getLogs(),
        apiService.getCurrentDate()
      ]);
      setInventory(inventoryData);
      setContainers(containersData);
      setWasteItems(wasteData);
      setLogs(logsData);
      setCurrentDate(dateData);
    } catch (err) {
      setError(err.message || 'Failed to load data. Please check your network connection and try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemSelect = (itemId) => {
    console.log('Selected item:', itemId);
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      console.log('Setting selected item:', item);
      setSelectedItem(item);
      setFormData(prev => ({
        ...prev,
        itemId: item.id
      }));
      validateForm(item.id, formData.containerId);
    }
  };

  const handleContainerSelect = (containerId) => {
    console.log('Selected container:', containerId);
    const container = containers.find(c => c.container_id === containerId);
    if (container) {
      console.log('Setting selected container:', container);
      setSelectedContainer(container);
      setFormData(prev => ({
        ...prev,
        containerId: container.container_id
      }));
      validateForm(formData.itemId, container.container_id);
    }
  };

  const validateForm = (itemId, containerId) => {
    console.log('Validating form with:', { itemId, containerId });
    if (!itemId || !containerId) {
      setFormStatus({ isValid: false, message: '' });
      return;
    }

    const item = inventory.find(i => i.id === itemId);
    const container = containers.find(c => c.container_id === containerId);

    console.log('Found item and container:', { item, container });

    if (!item || !container) {
      setFormStatus({ isValid: false, message: 'Invalid selection' });
      return;
    }

    setFormStatus({ isValid: true, message: 'Ready to place item' });
  };

  const handlePlaceItem = async (itemId, containerId) => {
    try {
      // If containerId is provided directly (from dropdown), use it
      // Otherwise, use the selectedItem and selectedContainer state
      const finalItemId = itemId || selectedItem?.id;
      const finalContainerId = containerId || selectedContainer?.container_id;

      if (!finalItemId || !finalContainerId) {
        setError('Both item and container must be selected');
        return;
      }

      setError(null);
      setSuccessMessage(null);
      setLoading(true);

      console.log('Placing item with IDs:', { 
        item_id: finalItemId,
        container_id: finalContainerId
      });

      const response = await fetch(`http://localhost:8000/api/items/place?item_id=${finalItemId}&container_id=${finalContainerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.detail || 'Failed to place item';
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      const data = await response.json();
      console.log('Place item response:', data);

      setSuccessMessage('Item placed successfully!');
      setSelectedItem(null);
      setSelectedContainer(null);
      setFormData({ itemId: '', containerId: '' });
      setFormStatus({ isValid: false, message: '' });
      fetchData(); // Refresh data after successful placement
    } catch (error) {
      console.error('Error placing item:', error);
      const errorMessage = error.message || 'An unexpected error occurred while placing the item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveItem = async (itemId) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await apiService.retrieveItem(itemId);
      setSuccessMessage('Item retrieved successfully!');
      // Increment usage_count for the retrieved item
      setInventory(prevInventory => prevInventory.map(item =>
        item.id === itemId ? { ...item, usage_count: item.usage_count + 1 } : item
      ));
      fetchData(); // Refresh data after successful retrieval
    } catch (err) {
      setError(err.message || 'Failed to retrieve item. Please try again.');
      console.error('Error retrieving item:', err);
    }
  };

  const handleMarkAsWaste = async (itemId) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await apiService.markAsWaste(itemId);
      setSuccessMessage('Item marked as waste successfully!');
      fetchData(); // Refresh data after successful marking
    } catch (err) {
      setError(err.message || 'Failed to mark item as waste. Please try again.');
      console.error('Error marking item as waste:', err);
    }
  };

  const handleFastForward = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await apiService.fastForward(fastForwardDays);
      setCurrentDate(response.new_date);
      setFastForwardDays(1); // Reset to 1 after fast-forwarding
      
      // Update waste items with expired items
      const expiredItems = response.expired_items || [];
      
      if (expiredItems.length > 0) {
        // Fetch updated waste items
        const wasteData = await apiService.getWasteItems();
        setWasteItems(wasteData);
        setSuccessMessage(`${expiredItems.length} items have expired and been marked as waste.`);
      } else {
        setSuccessMessage('Time fast-forwarded successfully!');
      }
      
      fetchData(); // Refresh data after fast-forward
    } catch (err) {
      setError(err.message || 'Failed to fast-forward time. Please try again.');
      console.error('Error fast-forwarding time:', err);
    }
  };

  const setSpecificDate = async () => {
    try {
      setError(null);
      const response = await apiService.setDate('2025-04-06');
      setCurrentDate(response.new_date);
      fetchData(); // Refresh data after setting date
    } catch (err) {
      setError(err.message || 'Failed to set date. Please try again.');
      console.error('Error setting date:', err);
    }
  };

  useEffect(() => {
    // Call setSpecificDate when component mounts
    setSpecificDate();
  }, []);

  const renderLoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="spinner-border" style={styles.loadingSpinner} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset pagination when changing tabs
    setInventoryPage(1);
    setContainersPage(1);
    // Clear import status when changing tabs
    setImportStatus(null);
    // Refresh data when changing tabs
    fetchData();
    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.style.opacity = '0';
      setTimeout(() => {
        tabContent.style.opacity = '1';
      }, 100);
    }
  };

  const handleRowHover = (index) => {
    setHoveredRow(index);
  };

  const handleContainerHover = (containerId) => {
    setHoveredContainer(containerId);
  };

  useEffect(() => {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }, [containers]);

  useEffect(() => {
    const counters = document.querySelectorAll('.display-4');
    counters.forEach(counter => {
      const target = parseInt(counter.textContent);
      let current = 0;
      const increment = target / 50;
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      updateCounter();
    });
  }, [inventory.length, wasteItems.length, logs.length]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        setImportStatus({ type: 'info', message: 'Importing...' });
        
        // Prepare form data for upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Send to appropriate endpoint based on active tab
        const endpoint = activeTab === 'containers' 
            ? 'http://localhost:8000/api/import/containers'
            : 'http://localhost:8000/api/import/items';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to import data');
        }
        
        const result = await response.json();
        setImportStatus({
            type: 'success',
            message: `Successfully imported ${result.items_added || result.containers_added} ${activeTab}`
        });
        
        // Refresh the data
        fetchData();
        
    } catch (error) {
        setImportStatus({
            type: 'error',
            message: error.message
        });
    }
    
    // Reset file input
    event.target.value = '';
  };

  const renderOverview = () => (
    <div className="row">
      <div className="col-md-4 mb-4">
        <div 
          style={{ 
            ...styles.card, 
            ...(hoveredCard === 'inventory' ? styles.cardHover : {}),
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setHoveredCard('inventory')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleTabChange('inventory')}
        >
          <div className="d-flex justify-content-between align-items-start mb-4">
            <h5 className="card-title m-0" style={styles.cardTitle}>Inventory Status</h5>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(233, 69, 96, 0.1)' }}>
                <span style={{ color: '#e94560', fontSize: '1.5rem' }}>📦</span>
              </div>
            </div>
          <div className="mb-4">
            <div className="d-flex align-items-baseline mb-2">
              <div style={{ ...styles.display4, fontSize: '3rem', lineHeight: '1' }}>{inventory.length}</div>
              <div style={{ ...styles.statLabel, marginLeft: '1rem' }}>Total Items</div>
            </div>
          </div>
          <div className="progress mb-3" style={{ height: '8px', backgroundColor: '#374151' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ 
                  width: `${(inventory.filter(item => item.status === 'available').length / inventory.length) * 100}%`,
                  backgroundColor: '#10b981'
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              <span>Available: {inventory.filter(item => item.status === 'available').length}</span>
              <span>Placed: {inventory.filter(item => item.status === 'placed').length}</span>
            <span>Waste: {inventory.filter(item => item.status === 'waste').length}</span>
            </div>
          </div>
        </div>

      <div className="col-md-4 mb-4">
        <div 
          style={{ 
            ...styles.card, 
            ...(hoveredCard === 'waste' ? styles.cardHover : {}),
            padding: '1.5rem'
          }}
          onMouseEnter={() => setHoveredCard('waste')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="d-flex justify-content-between align-items-start mb-4">
            <h5 className="card-title m-0" style={styles.cardTitle}>Waste Items</h5>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <span style={{ color: '#ef4444', fontSize: '1.5rem' }}>🗑️</span>
              </div>
            </div>
          <div className="mb-4">
            <div className="d-flex align-items-baseline mb-2">
              <div style={{ ...styles.display4, fontSize: '3rem', lineHeight: '1', color: '#ef4444' }}>{wasteItems.length}</div>
              <div style={{ ...styles.statLabel, marginLeft: '1rem' }}>Items Marked as Waste</div>
            </div>
          </div>
          <div className="progress mb-3" style={{ height: '8px', backgroundColor: '#374151' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ 
                  width: `${(wasteItems.length / inventory.length) * 100}%`,
                  backgroundColor: '#ef4444'
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              <span>Waste Rate: {((wasteItems.length / inventory.length) * 100).toFixed(1)}%</span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

      <div className="col-md-4 mb-4">
        <div 
          style={{ 
            ...styles.card, 
            ...(hoveredCard === 'logs' ? styles.cardHover : {}),
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setHoveredCard('logs')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleTabChange('logs')}
        >
          <div className="d-flex justify-content-between align-items-start mb-4">
            <h5 className="card-title m-0" style={styles.cardTitle}>System Logs</h5>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <span style={{ color: '#10b981', fontSize: '1.5rem' }}>📊</span>
              </div>
            </div>
          <div className="mb-4">
            <div className="d-flex align-items-baseline mb-2">
              <div style={{ ...styles.display4, fontSize: '3rem', lineHeight: '1', color: '#10b981' }}>{logs.length}</div>
              <div style={{ ...styles.statLabel, marginLeft: '1rem' }}>Total Log Entries</div>
            </div>
          </div>
          <div className="progress mb-3" style={{ height: '8px', backgroundColor: '#374151' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ 
                  width: `${(logs.length / 1000) * 100}%`,
                  backgroundColor: '#10b981'
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              <span>Last 24h: {logs.filter(log => new Date(log.timestamp) > new Date(Date.now() - 86400000)).length}</span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContainers = () => {
    const filteredContainers = containers
      .filter(container => 
        container.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.container_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const startIndex = (containersPage - 1) * ITEMS_PER_PAGE;
    const paginatedContainers = filteredContainers
      .slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={styles.title}>Containers</h2>
              <input
                type="text"
                placeholder="Search containers..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setContainersPage(1); // Reset page when searching
                }}
                style={{
                  ...styles.formControl,
                  width: '200px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  height: '35px'
                }}
              />
            </div>
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
            </div>
          </div>

          {importStatus && activeTab === 'containers' && (
            <div style={{
              ...styles.alert,
              backgroundColor: importStatus.type === 'success' ? '#4caf50' : '#f44336'
            }}>
              {importStatus.message}
            </div>
          )}

        {loading ? renderLoadingSpinner() : (
            <>
          <div className="row g-4">
                {paginatedContainers.map((container) => (
                  <div key={container.container_id} className="col-md-6">
                <div 
                  className="card h-100"
                  style={{ 
                    ...styles.card,
                    backgroundColor: '#1f2937',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: hoveredContainer === container.container_id ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                      onMouseEnter={() => handleContainerHover(container.container_id)}
                  onMouseLeave={() => handleContainerHover(null)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="card-subtitle mb-2" style={{ color: '#e94560' }}>{container.zone}</h6>
                          <span className="badge bg-info">
                            {container.container_id}
                      </span>
                    </div>
                    <div className="table-responsive">
                      <table className="table" style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.tableHeader}>ID</th>
                            <th style={styles.tableHeader}>Item</th>
                            <th style={styles.tableHeader}>Usage</th>
                            <th style={styles.tableHeader}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory
                                .filter(item => item.container_id === container.container_id)
                            .map((item, index) => (
                              <tr 
                                key={item.id} 
                                style={{ 
                                  ...styles.tableCell,
                                  backgroundColor: hoveredRow === index ? '#374151' : '#1f2937',
                                  transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={() => handleRowHover(index)}
                                onMouseLeave={() => handleRowHover(null)}
                              >
                                <td style={styles.tableCell}>{item.id}</td>
                                <td style={styles.tableCell}>{item.name}</td>
                                <td style={styles.tableCell}>
                                  <span className={`badge ${item.usage_count >= item.usage_limit ? 'bg-danger' : 'bg-success'}`}>
                                    {item.usage_count}/{item.usage_limit}
                                  </span>
                                </td>
                                <td style={styles.tableCell}>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    style={{ 
                                      ...styles.button, 
                                      ...styles.buttonPrimary,
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem'
                                    }}
                                    onClick={() => handleRetrieveItem(item.id)}
                                    disabled={loading}
                                  >
                                    Retrieve
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
              
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  className="btn btn-primary"
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => setContainersPage(prev => Math.max(1, prev - 1))}
                  disabled={containersPage === 1}
                >
                  Previous 100
                </button>
                <span style={{ color: '#fff' }}>
                  Showing {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredContainers.length)} of {filteredContainers.length}
                </span>
                <button
                  className="btn btn-primary"
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => setContainersPage(prev => prev + 1)}
                  disabled={startIndex + ITEMS_PER_PAGE >= filteredContainers.length}
                >
                  Next 100
                </button>
              </div>
            </>
        )}
      </div>
    </div>
  );
  };

  const renderPlacement = () => {
    const availableItems = inventory
      .filter(item => item.container_id === null)
      .filter(item => 
        itemSearchQuery 
          ? item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
            item.id.toString().includes(itemSearchQuery)
          : true
      );

    const availableContainers = containers
      .filter(container => {
        // If an item is selected, check if it fits in the container
        if (selectedItem) {
          const itemFits = 
            selectedItem.width <= container.width_cm &&
            selectedItem.height <= container.height_cm &&
            selectedItem.depth <= container.depth_cm;
          
          if (!itemFits) return false;
        }

      // Calculate container volume
        const containerVolume = container.width_cm * container.depth_cm * container.height_cm;
      // Calculate used volume by summing up volumes of items in the container
      const usedVolume = inventory
          .filter(item => item.container_id === container.container_id)
          .reduce((total, item) => total + (item.width * item.height * item.depth), 0);
      // Consider container available if less than 80% full
      return (usedVolume / containerVolume) < 0.8;
      })
      .filter(container =>
        containerSearchQuery
          ? container.zone.toLowerCase().includes(containerSearchQuery.toLowerCase()) ||
            container.container_id.toLowerCase().includes(containerSearchQuery.toLowerCase())
          : true
      );

    const itemStartIndex = (itemsPlacementPage - 1) * ITEMS_PER_PAGE;
    const containerStartIndex = (containersPlacementPage - 1) * ITEMS_PER_PAGE;

    const paginatedItems = availableItems.slice(itemStartIndex, itemStartIndex + ITEMS_PER_PAGE);
    const paginatedContainers = availableContainers.slice(containerStartIndex, containerStartIndex + ITEMS_PER_PAGE);

    return (
      <>
        <div className="card" style={styles.card}>
            <div className="card-body">
                <h5 className="card-title" style={styles.cardTitle}>Place Item</h5>
                {error && (
                    <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                        {successMessage}
                    </div>
                )}
                <div className="row">
                    <div className="col-md-6">
                        <div className="card mb-4" style={{ ...styles.card, backgroundColor: '#1f2937' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="card-subtitle" style={{ color: '#e94560' }}>Select Item</h6>
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={itemSearchQuery}
                                        onChange={(e) => {
                                            setItemSearchQuery(e.target.value);
                                            setItemsPlacementPage(1);
                                        }}
                                        style={{
                                            ...styles.formControl,
                                            width: '200px',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.9rem',
                                            height: '35px'
                                        }}
                                    />
                                </div>
                                <div className="table-responsive">
                                    <table className="table" style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>ID</th>
                                                <th style={styles.tableHeader}>Name</th>
                                                <th style={styles.tableHeader}>Usage</th>
                                                <th style={styles.tableHeader}>Select</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedItems.map((item) => (
                                                <tr 
                                                    key={item.id}
                                                    style={{ 
                                                        ...styles.tableCell,
                                                        backgroundColor: selectedItem?.id === item.id ? '#374151' : '#1f2937',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <td style={styles.tableCell}>{item.id}</td>
                                                    <td style={styles.tableCell}>{item.name}</td>
                                                    <td style={styles.tableCell}>
                                                        <span className={`badge ${item.usage_count >= item.usage_limit ? 'bg-danger' : 'bg-success'}`}>
                                                            {item.usage_count}/{item.usage_limit}
                                                        </span>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name={`itemSelection_${item.id}`}
                                                                checked={selectedItem?.id === item.id}
                                                                onChange={() => handleItemSelect(item.id)}
                                                                style={{ 
                                                                    cursor: 'pointer',
                                                                    borderColor: '#6B7280',
                                                                    backgroundColor: selectedItem?.id === item.id ? '#e94560' : 'transparent'
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <button
                                        className="btn btn-primary"
                                        style={{ ...styles.button, ...styles.buttonPrimary }}
                                        onClick={() => setItemsPlacementPage(prev => Math.max(1, prev - 1))}
                                        disabled={itemsPlacementPage === 1}
                                    >
                                        Previous 100
                                    </button>
                                    <span style={{ color: '#fff' }}>
                                        Showing {itemStartIndex + 1} - {Math.min(itemStartIndex + ITEMS_PER_PAGE, availableItems.length)} of {availableItems.length}
                                    </span>
                                    <button
                                        className="btn btn-primary"
                                        style={{ ...styles.button, ...styles.buttonPrimary }}
                                        onClick={() => setItemsPlacementPage(prev => prev + 1)}
                                        disabled={itemStartIndex + ITEMS_PER_PAGE >= availableItems.length}
                                    >
                                        Next 100
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card mb-4" style={{ ...styles.card, backgroundColor: '#1f2937' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="card-subtitle" style={{ color: '#e94560' }}>Select Container</h6>
                                    <input
                                        type="text"
                                        placeholder="Search containers..."
                                        value={containerSearchQuery}
                                        onChange={(e) => {
                                            setContainerSearchQuery(e.target.value);
                                            setContainersPlacementPage(1);
                                        }}
                                        style={{
                                            ...styles.formControl,
                                            width: '200px',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.9rem',
                                            height: '35px'
                                        }}
                                    />
                                </div>
                                <div className="table-responsive">
                                    <table className="table" style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>ID</th>
                                                <th style={styles.tableHeader}>Zone</th>
                                                <th style={styles.tableHeader}>Dimensions (cm)</th>
                                                <th style={styles.tableHeader}>Usage</th>
                                                <th style={styles.tableHeader}>Select</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedContainers.map((container) => {
                                                // Calculate container volume
                                                const containerVolume = container.width_cm * container.depth_cm * container.height_cm;
                                                // Calculate used volume by summing up volumes of items in the container
                                                const usedVolume = inventory
                                                    .filter(item => item.container_id === container.container_id)
                                                    .reduce((total, item) => total + (item.width_cm * item.depth_cm * item.height_cm), 0);
                                                return (
                                                    <tr 
                                                        key={container.container_id}
                                                        style={{ 
                                                            ...styles.tableCell,
                                                            backgroundColor: selectedContainer?.container_id === container.container_id ? '#374151' : '#1f2937',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <td style={styles.tableCell}>{container.container_id}</td>
                                                        <td style={styles.tableCell}>{container.zone}</td>
                                                        <td style={styles.tableCell}>
                                                            {container.width_cm} x {container.height_cm} x {container.depth_cm}
                                                        </td>
                                                        <td style={styles.tableCell}>
                                                            <div className="progress" style={{ height: '8px', backgroundColor: '#374151' }}>
                                                                <div 
                                                                    className="progress-bar" 
                                                                    role="progressbar" 
                                                                    style={{ 
                                                                        width: `${(usedVolume / containerVolume) * 100}%`,
                                                                        backgroundColor: (usedVolume / containerVolume) >= 0.8 ? '#ef4444' : '#10b981'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <small style={{ color: '#9ca3af' }}>
                                                                {Math.round((usedVolume / containerVolume) * 100)}% full
                                                            </small>
                                                        </td>
                                                        <td style={styles.tableCell}>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="containerSelection"
                                                                    checked={selectedContainer?.container_id === container.container_id}
                                                                    onChange={() => handleContainerSelect(container.container_id)}
                                                                    style={{ 
                                                                        cursor: 'pointer',
                                                                        borderColor: '#6B7280',
                                                                        backgroundColor: selectedContainer?.container_id === container.container_id ? '#e94560' : 'transparent'
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <button
                                        className="btn btn-primary"
                                        style={{ ...styles.button, ...styles.buttonPrimary }}
                                        onClick={() => setContainersPlacementPage(prev => Math.max(1, prev - 1))}
                                        disabled={containersPlacementPage === 1}
                                    >
                                        Previous 100
                                    </button>
                                    <span style={{ color: '#fff' }}>
                                        Showing {containerStartIndex + 1} - {Math.min(containerStartIndex + ITEMS_PER_PAGE, availableContainers.length)} of {availableContainers.length}
                                    </span>
                                    <button
                                        className="btn btn-primary"
                                        style={{ ...styles.button, ...styles.buttonPrimary }}
                                        onClick={() => setContainersPlacementPage(prev => prev + 1)}
                                        disabled={containerStartIndex + ITEMS_PER_PAGE >= availableContainers.length}
                                    >
                                        Next 100
                                    </button>
                                </div>
                            </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {selectedItem && selectedContainer && (
                        <button
                            className="btn btn-primary"
                style={{ 
                    ...styles.floatingButton,
                }}
                onClick={() => {
                    console.log('Placing item:', selectedItem);
                    console.log('In container:', selectedContainer);
                    handlePlaceItem(selectedItem.id, selectedContainer.container_id);
                }}
                disabled={loading || !selectedItem || !selectedContainer}
            >
                {loading ? (
                    <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Placing...
                    </span>
                ) : (
                    <span>
                        Place {selectedItem.name} in {selectedContainer.zone}
                    </span>
                )}
            </button>
        )}
      </>
    );
  };

  const renderInventory = () => {
    const filteredItems = inventory
      .filter(item => 
        searchQuery 
          ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toString().includes(searchQuery)
          : true
      );
    
    const startIndex = (inventoryPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems
      .slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={styles.title}>Inventory</h2>
              <input
                type="text"
                placeholder="Search items..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setInventoryPage(1); // Reset page when searching
                }}
                style={{
                  ...styles.formControl,
                  width: '200px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  height: '35px'
                }}
              />
            </div>
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
                    </div>
            </div>

          {importStatus && activeTab === 'inventory' && (
            <div style={{
              ...styles.alert,
              backgroundColor: importStatus.type === 'success' ? '#4caf50' : '#f44336',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              {importStatus.message}
        </div>
          )}

        {loading ? renderLoadingSpinner() : (
            <>
          <div className="table-responsive">
            <table className="table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Item ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Usage</th>
                      <th style={styles.tableHeader}>Container</th>
                      <th style={styles.tableHeader}>Position</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                    {paginatedItems.map((item) => {
                      const container = containers.find(c => c.container_id === item.container_id);
                      return (
                  <tr key={item.id} style={{ backgroundColor: '#1f2937' }}>
                    <td style={styles.tableCell}>{item.id}</td>
                    <td style={styles.tableCell}>{item.name}</td>
                    <td style={styles.tableCell}>
                      <span className={`badge ${item.usage_count >= item.usage_limit ? 'bg-danger' : 'bg-success'}`}>
                        {item.usage_count}/{item.usage_limit}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                            {container ? container.zone : 'Not placed'}
                          </td>
                          <td style={styles.tableCell}>
                            {item.container_id ? 
                              `(${item.x}, ${item.y}, ${item.z})` : 
                              'Not placed'
                            }
                          </td>
                          <td style={styles.tableCell}>
                            {item.container_id ? (
                              <button
                                className="btn btn-sm btn-danger me-2"
                                style={styles.button}
                                onClick={() => handleRetrieveItem(item.id)}
                              >
                                Retrieve
                              </button>
                            ) : (
                              <div className="d-flex align-items-center gap-2">
                        <select 
                          className="form-select form-select-sm"
                                  onChange={(e) => {
                                    handleItemSelect(item.id);
                                    handleContainerSelect(e.target.value);
                                  }}
                                  value={selectedContainer?.container_id || ""}
                          style={{ 
                            backgroundColor: '#1f2937',
                            color: '#fff',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    width: '200px'
                          }}
                        >
                          <option value="">Select Container</option>
                          {containers.map(container => (
                                    <option key={container.container_id} value={container.container_id}>
                                      {container.zone} ({container.container_id})
                            </option>
                          ))}
                        </select>
                                {selectedItem?.id === item.id && selectedContainer && (
                        <button
                          className="btn btn-sm btn-primary"
                                    style={{ 
                                      ...styles.button, 
                                      ...styles.buttonPrimary,
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem'
                                    }}
                                    onClick={() => handlePlaceItem(selectedItem.id, selectedContainer.container_id)}
                                  >
                                    Place
                        </button>
                                )}
                              </div>
                      )}
                    </td>
                  </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  className="btn btn-primary"
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => setInventoryPage(prev => Math.max(1, prev - 1))}
                  disabled={inventoryPage === 1}
                >
                  Previous 100
                </button>
                <span style={{ color: '#fff' }}>
                  Showing {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
                </span>
                <button
                  className="btn btn-primary"
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => setInventoryPage(prev => prev + 1)}
                  disabled={startIndex + ITEMS_PER_PAGE >= filteredItems.length}
                >
                  Next 100
                </button>
              </div>
            </>
        )}
      </div>
    </div>
  );
  };

  const renderLogs = () => (
    <div className="card" style={styles.card}>
      <div className="card-body">
        <h5 className="card-title" style={styles.cardTitle}>System Logs</h5>
        {loading ? renderLoadingSpinner() : (
          <div className="table-responsive">
            <table className="table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Timestamp</th>
                  <th style={styles.tableHeader}>Action</th>
                  <th style={styles.tableHeader}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} style={{ backgroundColor: '#1f2937' }}>
                    <td style={styles.tableCell}>{formatDate(log.timestamp)}</td>
                    <td style={styles.tableCell}>{log.action}</td>
                    <td style={styles.tableCell}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardBackground} />
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ ...styles.display4, fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          ISS Cargo Management System
        </h1>
        <p style={{ ...styles.statLabel, opacity: 0.7 }}>
          Smart. Secure. Space-bound.
        </p>
      </div>

      {error && (
        <div 
          className="alert alert-danger alert-dismissible fade show"
          style={{
            ...styles.alert,
            backgroundColor: '#dc3545',
            color: '#fff',
            padding: '1rem',
            marginBottom: '1rem'
          }}
          role="alert"
        >
          {typeof error === 'string' ? error : 'An unexpected error occurred'}
          <button 
            type="button" 
            className="btn-close" 
            style={{ filter: 'invert(1)' }}
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {successMessage && (
        <div 
          className="alert alert-success alert-dismissible fade show"
          style={{
            ...styles.alert,
            backgroundColor: '#198754',
            color: '#fff',
            padding: '1rem',
            marginBottom: '1rem'
          }}
          role="alert"
        >
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            style={{ filter: 'invert(1)' }}
            onClick={() => setSuccessMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center" style={styles.navTabs}>
        <ul className="nav nav-tabs border-0 d-flex flex-nowrap">
        {['overview', 'containers', 'placement', 'inventory', 'logs'].map(tab => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              style={{
                ...styles.navLink,
                ...(activeTab === tab ? styles.navLinkActive : {}),
                ...(activeTab !== tab ? styles.navLinkHover : {}),
                transform: activeTab === tab ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>
        <div className="d-flex align-items-center">
          <span className="me-3" style={styles.statLabel}>
            Current Date: {formatDate(currentDate)}
          </span>
          <div className="d-flex align-items-center">
            <div className="input-group" style={{ width: 'auto' }}>
              <input
                type="number"
                className="form-control"
                style={{
                  ...styles.formControl,
                  width: '120px',
                  padding: '0.5rem',
                  paddingRight: '65px',
                  paddingLeft: '12px',
                  textAlign: 'left'
                }}
                value={fastForwardDays}
                onChange={(e) => setFastForwardDays(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
              <span 
                className="position-absolute" 
                style={{ 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6B7280',
                  pointerEvents: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                days
              </span>
            </div>
            <style>
              {`
                input[type="number"]::-webkit-inner-spin-button {
                  opacity: 1;
                  margin-left: 12px;
                  margin-right: 8px;
                }
              `}
            </style>
            <button
              className="btn ms-2"
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                padding: '0.5rem 1rem'
              }}
              onClick={handleFastForward}
            >
              Fast Forward
            </button>
          </div>
        </div>
      </div>

      <div className="tab-content" style={{ transition: 'opacity 0.3s ease' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'containers' && renderContainers()}
        {activeTab === 'placement' && renderPlacement()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
};

export default Dashboard;