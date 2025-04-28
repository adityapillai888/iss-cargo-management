import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [fastForwardDays, setFastForwardDays] = useState(1);
  const [containers, setContainers] = useState([]);
  const [items, setItems] = useState([]);
  const [wasteItems, setWasteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    setSpecificDate();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [containersData, itemsData, wasteData] = await Promise.all([
        apiService.getContainers(),
        apiService.getItems(),
        apiService.getWasteItems()
      ]);
      setContainers(containersData);
      setItems(itemsData);
      setWasteItems(wasteData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const setSpecificDate = async () => {
    try {
      await apiService.setDate('2025-04-06');
      const date = await apiService.getCurrentDate();
      setCurrentDate(date);
    } catch (err) {
      setError('Failed to set date');
    }
  };

  const handleFastForward = async () => {
    try {
      await apiService.fastForward(fastForwardDays);
      const date = await apiService.getCurrentDate();
      setCurrentDate(date);
      setFastForwardDays(1);
      fetchData();
    } catch (err) {
      setError('Failed to fast forward');
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 tracking-tight">
            ISS Cargo Management System
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Smart. Secure. Space-bound.
          </p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Date Controls */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Current Date</h2>
                  <p className="text-gray-500">{currentDate}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={fastForwardDays}
                    onChange={(e) => setFastForwardDays(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleFastForward}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Fast Forward
                  </button>
                </div>
              </div>
            </div>

            {/* Containers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {containers.map((container) => (
                <div key={container.id} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{container.name}</h3>
                  <p className="text-gray-500">Capacity: {container.capacity}</p>
                  <p className="text-gray-500">Current Load: {container.current_load}</p>
                </div>
              ))}
            </div>

            {/* Items and Waste Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900">Available Items</h3>
                <p className="text-gray-500">Total: {items.length}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900">Waste Items</h3>
                <p className="text-gray-500">Total: {wasteItems.length}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 