import React, { useState } from 'react';
import { login, register } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function Auth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); // clear error when typing
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setForm({ username: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu');
      return;
    }

    if (isRegister && !form.confirmPassword.trim()) {
      setError('Vui lòng xác nhận mật khẩu');
      return;
    }

    if (isRegister && form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        // Register API call
        const response = await register({
          username: form.username,
          password: form.password,
          confirmPassword: form.confirmPassword
        });
        addToast(response.data.message || 'Đăng ký tài khoản thành công! Hãy đăng nhập.', 'success');
        // Switch to login mode and keep username
        const registeredUsername = form.username;
        setIsRegister(false);
        setForm({
          username: registeredUsername,
          password: '',
          confirmPassword: ''
        });
      } else {
        // Login API call
        const response = await login({
          username: form.username,
          password: form.password
        });
        const token = response.data.token;
        localStorage.setItem('token', token);
        addToast('Đăng nhập thành công!', 'success');

        // Wait a tiny bit for toast before changing state
        setTimeout(() => {
          onAuthSuccess();
        }, 600);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Đã xảy ra lỗi, vui lòng thử lại';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2e22 0%, #0d1711 100%)',
      padding: '20px',
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
    }}>
      <ToastContainer />

      <div style={{
        background: 'var(--bg2)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        padding: '35px 30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box'
      }}>
        {/* Brand/Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '32px',
            background: 'rgba(74, 222, 128, 0.15)',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            color: 'var(--sidebar-brand)'
          }}>
            🏨
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0'
          }}>
            {isRegister ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </h2>
          <p style={{
            fontSize: '13px',
            color: 'var(--text3)',
            margin: 0
          }}>
            Hệ thống quản lý nhà nghỉ & phòng trọ
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          background: 'var(--bg)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: !isRegister ? 'var(--bg2)' : 'transparent',
              color: !isRegister ? 'var(--accent)' : 'var(--text3)',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: isRegister ? 'var(--bg2)' : 'transparent',
              color: isRegister ? 'var(--accent)' : 'var(--text3)',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Đăng ký
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 500,
              marginBottom: '18px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '14px',
              borderRadius: '10px',
              marginTop: '10px'
            }}
          >
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </form>

        {/* Footer switcher link */}
        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <button
            type="button"
            onClick={handleToggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
            onMouseLeave={e => e.target.style.color = 'var(--text3)'}
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký tại đây'}
          </button>
        </div>
      </div>
    </div>
  );
}
