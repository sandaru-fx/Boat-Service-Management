import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUserTie,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSort,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaIdCard,
  FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const UserManagementList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  // const [selectedUsers, setSelectedUsers] = useState([]); // For future bulk operations
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const itemsPerPage = 10;

  // Set active tab from URL parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && (tabParam === 'customers' || tabParam === 'employees')) {
      setActiveTab(tabParam);
    }
  }, []);

  // Fetch users based on active tab
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to access user management');
        navigate('/login');
        return;
      }
      
      const role = activeTab === 'customers' ? 'customer' : 'employee';
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/search?role=${role}&page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.total || 0);
      } else {
        const errorData = await response.json();
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/dashboard');
        } else {
          throw new Error(errorData.message || 'Failed to fetch users');
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, searchTerm, sortBy, sortOrder]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">Inactive</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">Active</span>;
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage customers and employees</p>
            </div>
            <button
              onClick={() => navigate(`/admin/create-employee?from=/admin/users?tab=${activeTab}`)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'customers'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUsers className="w-4 h-4" />
                Customers ({activeTab === 'customers' ? totalUsers : '...'})
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'employees'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUserTie className="w-4 h-4" />
                Employees ({activeTab === 'employees' ? totalUsers : '...'})
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                {activeTab === 'employees' && <option value="employeeData.position">Position</option>}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <FaSort className="w-4 h-4" />
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : `No ${activeTab} have been created yet`}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                  </div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">{activeTab === 'employees' ? 'Position & Status' : 'Status'}</div>
                  <div className="col-span-2">Date Joined</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <div key={user._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Checkbox */}
                      <div className="col-span-1 flex justify-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                      </div>

                      {/* User Info */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                              <FaUser className="w-4 h-4 text-teal-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <FaIdCard className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{user.nic}</span>
                            </div>
                            {activeTab === 'employees' && user.employeeData?.employeeId && (
                              <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                <FaUserTie className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate font-mono">{user.employeeData.employeeId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="col-span-3">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-900 flex items-start gap-1">
                            <FaEnvelope className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <FaPhone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{user.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status (Customers) or Position & Status (Employees) */}
                      <div className="col-span-2">
                        <div className="space-y-1">
                          {activeTab === 'employees' ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                <FaUserTie className="w-3 h-3 mr-1 flex-shrink-0" />
                                {user.employeeData?.position || 'Employee'}
                              </span>
                              {getStatusBadge(user)}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(user)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date Joined */}
                      <div className="col-span-2">
                        <div className="text-xs text-gray-900 flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="whitespace-nowrap">{formatDate(user.createdAt)}</span>
                        </div>
                        {user.employeeData?.hireDate && (
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            Hired: {formatDate(user.employeeData.hireDate)}
                          </div>
                        )}
                      </div>


                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}?tab=${activeTab}`)}
                            className="text-teal-600 hover:text-teal-800 p-1 rounded hover:bg-teal-50"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}/edit?tab=${activeTab}`)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Edit User"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Delete User"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <FaTrash className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This will permanently remove their account and all associated data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementList;
