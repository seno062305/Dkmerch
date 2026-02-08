import React, { useState, useEffect } from "react";
import "./LoginModal.css";
import { useAuth } from "../context/AuthContext";
import RegisterModal from "./RegisterModal";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add('login-modal-open');
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove('login-modal-open');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = login(formData.email, formData.password);

    if (!result.success) {
      alert(result.message);
      return;
    }

    // 🔥 ADMIN AUTO REDIRECT
    if (result.role === "admin") {
      alert("Welcome back, Administrator!");
      onClose();
      navigate("/admin", { replace: true });
      return;
    }

    // normal user
    alert("Login successful!");
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ CLEAR LOGIN FORM AND SWITCH TO REGISTER
  const handleSwitchToRegister = () => {
    setFormData({ email: "", password: "" });
    setShowRegister(true);
  };

  // ✅ FORGOT PASSWORD - REDIRECT TO SETTINGS (KAHIT HINDI NAKA-LOGIN)
  const handleForgotPassword = () => {
    // Close modal
    onClose();
    
    // Set flag in localStorage to indicate forgot password flow
    localStorage.setItem('dkmerch_forgot_password', 'true');
    
    // Navigate to settings with password tab active
    navigate("/settings", { state: { activeTab: "password", forgotPassword: true } });
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  // switch to Register modal
  if (showRegister) {
    return <RegisterModal onClose={handleRegisterSuccess} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shopee" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header simple">
          <h3>Log In</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="shopee-body">
          <input
            type="text"
            name="email"
            placeholder="Email / Username"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary full">
            LOG IN
          </button>

          {/* FORGOT PASSWORD LINK */}
          <div className="forgot-password-link">
            <button
              type="button"
              className="link-button"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="signup-text">
            New to DKMerch?{" "}
            <button
              type="button"
              className="link-button"
              onClick={handleSwitchToRegister}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;