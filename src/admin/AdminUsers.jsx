import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Load users from localStorage
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
    setFilteredUsers(storedUsers);
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character');
    }
    
    return errors;
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role
    });
    setPasswordErrors(validatePassword(user.password));
    setShowPassword(false);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setPasswordErrors([]);
    setShowPassword(false);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Check if deleted user is currently logged in
      const authUser = JSON.parse(localStorage.getItem('authUser'));
      if (authUser && authUser.id === userToDelete.id) {
        localStorage.removeItem('authUser');
        window.location.href = '/';
      }
      
      loadUsers();
      showNotification('User deleted successfully', 'success');
    }
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showNotification('Name is required', 'error');
      return;
    }
    if (!formData.username.trim()) {
      showNotification('Username is required', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showNotification('Valid email is required', 'error');
      return;
    }
    if (!formData.password.trim()) {
      showNotification('Password is required', 'error');
      return;
    }

    // Password validation
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      showNotification('Please meet all password requirements', 'error');
      return;
    }

    // Check for duplicate username (excluding current user)
    const duplicateUsername = users.find(u => 
      u.username === formData.username && u.id !== editingUser.id
    );
    if (duplicateUsername) {
      showNotification('Username already taken', 'error');
      return;
    }

    // Check for duplicate email (excluding current user)
    const duplicateEmail = users.find(u => 
      u.email === formData.email && u.id !== editingUser.id
    );
    if (duplicateEmail) {
      showNotification('Email already exists', 'error');
      return;
    }

    // Update user
    const updatedUsers = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...formData }
        : u
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update authUser if editing current user
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser && authUser.id === editingUser.id) {
      const updatedAuthUser = { ...authUser, ...formData };
      localStorage.setItem('authUser', JSON.stringify(updatedAuthUser));
    }

    loadUsers();
    setShowEditModal(false);
    setEditingUser(null);
    setPasswordErrors([]);
    showNotification('User updated successfully', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate password in real-time
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const getRoleBadgeClass = (role) => {
    return role === 'admin' ? 'role-badge admin' : 'role-badge user';
  };

  const formatDate = (id) => {
    if (id === 0) return 'Built-in Admin';
    const date = new Date(id);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="admin-users">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="users-header">
        <div className="header-left">
          <h1><i className="fas fa-users"></i> User Management</h1>
          <p className="subtitle">Manage all registered users and their information</p>
        </div>
        <div className="users-stats">
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div>
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-user-shield"></i>
            <div>
              <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
              <span className="stat-label">Admins</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-user"></i>
            <div>
              <span className="stat-number">{users.filter(u => u.role === 'user').length}</span>
              <span className="stat-label">Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="users-controls">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, username, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <i className="fas fa-user-slash"></i>
            <p>No users found</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id === 0 ? 'ADMIN' : user.id}</td>
                  <td className="user-name">
                    <i className="fas fa-user-circle"></i>
                    {user.name}
                  </td>
                  <td>@{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      <i className={`fas ${user.role === 'admin' ? 'fa-shield-alt' : 'fa-user'}`}></i>
                      {user.role}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(user.id)}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                      title="Edit User"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {user.id !== 0 && (
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user)}
                        title="Delete User"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-user-edit"></i> Edit User</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-user"></i> Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-at"></i> Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="password-requirements">
                  <p className="requirements-title">Password must contain:</p>
                  <ul>
                    <li className={formData.password.length >= 8 ? 'valid' : ''}>
                      <i className={`fas ${formData.password.length >= 8 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                      <i className={`fas ${/[A-Z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                      <i className={`fas ${/[a-z]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                      <i className={`fas ${/[0-9]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      One number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>
                      <i className={`fas ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      One special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-shield-alt"></i> Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <i className="fas fa-save"></i> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Delete User?</h2>
            <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                <i className="fas fa-trash"></i> Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;