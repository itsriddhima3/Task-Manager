// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, LogOut, User, CheckCircle, Circle, AlertCircle } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
  
  register: async (data) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  login: async (data) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  
  updateProfile: async (token, data) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  

  getTasks: async (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/tasks?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  
  createTask: async (token, data) => {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  updateTask: async (token, id, data) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  deleteTask: async (token, id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'pending' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCurrentPage('dashboard');
      loadTasks(storedToken);
    }
  }, []);

  useEffect(() => {
    filterAndSearchTasks();
  }, [tasks, searchQuery, filterStatus]);

 
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filterAndSearchTasks = () => {
    let filtered = [...tasks];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTasks(filtered);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateAuthForm = () => {
    const newErrors = {};
    if (!authForm.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(authForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!authForm.password) {
      newErrors.password = 'Password is required';
    } else if (authForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (currentPage === 'register' && !authForm.name) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTaskForm = () => {
    const newErrors = {};
    if (!taskForm.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!taskForm.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateAuthForm()) return;

    setLoading(true);
    try {
      const endpoint = currentPage === 'login' ? api.login : api.register;
      const result = await endpoint(authForm);

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setCurrentPage('dashboard');
        setAuthForm({ email: '', password: '', name: '' });
        setErrors({});
        showNotification(result.message);
        await loadTasks(result.token);
      } else {
        setErrors({ form: result.message });
      }
    } catch (error) {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setTasks([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
    showNotification('Logged out successfully');
  };

  const loadTasks = async (authToken) => {
    try {
      const result = await api.getTasks(authToken);
      if (result.success) {
        setTasks(result.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    setLoading(true);
    try {
      const result = await api.createTask(token, taskForm);
      if (result.success) {
        setTasks([result.task, ...tasks]);
        setTaskForm({ title: '', description: '', status: 'pending' });
        setShowTaskModal(false);
        setErrors({});
        showNotification(result.message);
      } else {
        setErrors({ form: result.message });
      }
    } catch (error) {
      setErrors({ form: 'Error creating task' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    setLoading(true);
    try {
      const result = await api.updateTask(token, editingTask._id, taskForm);
      if (result.success) {
        setTasks(tasks.map(task => 
          task._id === editingTask._id ? result.task : task
        ));
        setTaskForm({ title: '', description: '', status: 'pending' });
        setEditingTask(null);
        setShowTaskModal(false);
        setErrors({});
        showNotification(result.message);
      } else {
        setErrors({ form: result.message });
      }
    } catch (error) {
      setErrors({ form: 'Error updating task' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const result = await api.deleteTask(token, taskId);
      if (result.success) {
        setTasks(tasks.filter(task => task._id !== taskId));
        showNotification(result.message);
      }
    } catch (error) {
      showNotification('Error deleting task', 'error');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, description: task.description, status: task.status });
    setShowTaskModal(true);
    setErrors({});
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'pending' });
    setShowTaskModal(true);
    setErrors({});
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const result = await api.updateTask(token, task._id, { ...task, status: newStatus });
      if (result.success) {
        setTasks(tasks.map(t => t._id === task._id ? result.task : t));
      }
    } catch (error) {
      showNotification('Error updating task status', 'error');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.updateProfile(token, profileForm);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        setCurrentPage('dashboard');
        showNotification(result.message);
      } else {
        setErrors({ form: result.message });
      }
    } catch (error) {
      setErrors({ form: 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const Notification = () => {
    if (!notification) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      </div>
    );
  };

  if (currentPage === 'login' || currentPage === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Notification />
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Manager</h1>
            <p className="text-gray-600">
              {currentPage === 'login' ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          <div className="space-y-4">
            {currentPage === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
            </div>

            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.form}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (currentPage === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-gray-600">
            {currentPage === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setCurrentPage(currentPage === 'login' ? 'register' : 'login');
                setErrors({});
                setAuthForm({ email: '', password: '', name: '' });
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              {currentPage === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }


  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Notification />
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto p-6 mt-8">
          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
                <p className="text-gray-600">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileForm.name || user?.name || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email || user?.email || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="input-field"
                />
              </div>

              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.form}
                </div>
              )}

              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification />
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Task Manager
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setProfileForm({ name: user?.name || '', email: user?.email || '' });
                setCurrentPage('profile');
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.name}</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">Manage your tasks efficiently and stay organized</p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field min-w-[150px]"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={openCreateModal}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm">Create your first task to get started</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task._id}
                  className="task-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold mb-1 ${
                          task.status === 'completed' 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-800'
                        }`}>
                          {task.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {task.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="input-field"
                  placeholder="Task title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Task description"
                  rows="4"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.form}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setErrors({});
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTask ? handleUpdateTask : handleCreateTask}
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;