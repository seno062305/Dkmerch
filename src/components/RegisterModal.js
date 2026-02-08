import React, { useState, useEffect } from "react";
import "./RegisterModal.css";
import { useAuth } from "../context/AuthContext";

const RegisterModal = ({ onClose }) => {
  const { register } = useAuth(); // ✅ REMOVED login from destructuring

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [passwordFocused, setPasswordFocused] = useState(false);

  // ✅ PASSWORD VALIDATION STATE
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add('login-modal-open');
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove('login-modal-open');
    };
  }, []);

  // ✅ REAL-TIME PASSWORD VALIDATION
  useEffect(() => {
    const password = formData.password;
    
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [formData.password]);

  // ✅ CHECK IF PASSWORD IS VALID
  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(value => value === true);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // ✅ ENHANCED PASSWORD VALIDATION
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid()) {
      newErrors.password = "Password does not meet all requirements";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = register({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    // ✅ NO AUTO LOGIN - USER MUST LOGIN MANUALLY
    alert("Account created successfully! Please log in with your new account.");
    
    // ✅ CLEAR FORM BEFORE CLOSING
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    setErrors({});
    
    onClose(); // This will go back to LoginModal
  };

  // ✅ CLEAR FORM WHEN SWITCHING BACK TO LOGIN
  const handleSwitchToLogin = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    setErrors({});
    onClose();
  };

  // ✅ CLEAR FORM WHEN CLOSING MODAL (X button)
  const handleClose = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    setErrors({});
    onClose();
  };

  // ✅ PASSWORD STRENGTH CALCULATION
  const getPasswordStrength = () => {
    const validCount = Object.values(passwordValidation).filter(v => v).length;
    if (validCount === 0) return { text: '', percentage: 0, color: '' };
    if (validCount <= 2) return { text: 'Weak', percentage: 20, color: '#dc3545' };
    if (validCount === 3) return { text: 'Fair', percentage: 40, color: '#ffc107' };
    if (validCount === 4) return { text: 'Good', percentage: 70, color: '#17a2b8' };
    if (validCount === 5) return { text: 'Strong', percentage: 100, color: '#28a745' };
  };

  const strength = getPasswordStrength();

  // ✅ SHOW REQUIREMENTS ONLY WHEN: focused OR has password BUT NOT all valid
  const showPasswordRequirements = (passwordFocused || formData.password) && !isPasswordValid();

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content shopee register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header simple">
          <h3>Create Account</h3>
          <button className="modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="shopee-body">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`form-control ${errors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* ✅ PASSWORD WITH VALIDATION FEEDBACK */}
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`form-control ${errors.password ? 'error' : ''} ${isPasswordValid() && formData.password ? 'valid' : ''}`}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
            
            {/* ✅ PASSWORD STRENGTH BAR */}
            {formData.password && (
              <div className="password-strength-bar">
                <div 
                  className="password-strength-fill" 
                  style={{ 
                    width: `${strength.percentage}%`, 
                    backgroundColor: strength.color 
                  }}
                ></div>
              </div>
            )}
            {formData.password && strength.text && (
              <div className="password-strength-text" style={{ color: strength.color }}>
                Password Strength: {strength.text}
              </div>
            )}

            {/* ✅ PASSWORD REQUIREMENTS - HIDE WHEN ALL VALID */}
            {showPasswordRequirements && (
              <div className="password-requirements">
                <div className="requirement-title">Password Requirements:</div>
                <div className={`requirement-item ${passwordValidation.minLength ? 'valid' : 'invalid'}`}>
                  <i className={`fas ${passwordValidation.minLength ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  <span>At least 8 characters</span>
                </div>
                <div className={`requirement-item ${passwordValidation.hasUppercase ? 'valid' : 'invalid'}`}>
                  <i className={`fas ${passwordValidation.hasUppercase ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  <span>One uppercase letter (A-Z)</span>
                </div>
                <div className={`requirement-item ${passwordValidation.hasLowercase ? 'valid' : 'invalid'}`}>
                  <i className={`fas ${passwordValidation.hasLowercase ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  <span>One lowercase letter (a-z)</span>
                </div>
                <div className={`requirement-item ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}>
                  <i className={`fas ${passwordValidation.hasNumber ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  <span>One number (0-9)</span>
                </div>
                <div className={`requirement-item ${passwordValidation.hasSymbol ? 'valid' : 'invalid'}`}>
                  <i className={`fas ${passwordValidation.hasSymbol ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  <span>One special character (!@#$%^&*)</span>
                </div>
              </div>
            )}

            {/* ✅ SUCCESS MESSAGE WHEN PASSWORD IS VALID */}
            {isPasswordValid() && formData.password && (
              <div className="password-valid-message">
                <i className="fas fa-check-circle"></i>
                <span>Password meets all requirements!</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'valid' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <span className="success-text">
                <i className="fas fa-check-circle"></i> Passwords match
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary full"
            disabled={!isPasswordValid() || formData.password !== formData.confirmPassword}
          >
            CREATE ACCOUNT
          </button>

          <div className="signup-text">
            Already have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={handleSwitchToLogin}
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;