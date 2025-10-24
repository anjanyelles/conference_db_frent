import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
    if (user?.department_id) {
      setSelectedDepartment(user.department_id.toString());
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (selectedDepartment) {
      const department = departments.find(d => d.id.toString() === selectedDepartment);
      if (department) {
        navigate(`/room/${department.name.toLowerCase().replace(/\s+/g, '-')}`);
      }
    }
  };

  const handleDepartmentChange = async (e) => {
    const newDeptId = e.target.value;
    setSelectedDepartment(newDeptId);
    
    // In a real app, you'd update the user's department via API
    console.log('Department changed to:', newDeptId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Meeting Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome to Lakshya Meet. Select your department and join the meeting room.
            </p>
          </div>

          {/* Department Selection */}
          <div className="mb-8">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Select Department
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Choose a department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Department Info */}
          {selectedDepartment && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Ready to Join Meeting
              </h3>
              <p className="text-blue-700">
                You are about to join the{' '}
                <strong>
                  {departments.find(d => d.id.toString() === selectedDepartment)?.name}
                </strong>{' '}
                meeting room.
              </p>
            </div>
          )}

          {/* Join Room Button */}
          <div className="flex justify-center">
            <button
              onClick={handleJoinRoom}
              disabled={!selectedDepartment}
              className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Join Room
            </button>
          </div>

          {/* Departments Grid */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Departments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {department.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {department.description}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDepartment(department.id.toString());
                      setTimeout(handleJoinRoom, 100);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    Join Room
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;