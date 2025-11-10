import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';

const LoginPage = () => {
  const { login, logout, register } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: 'customer@foodfast.io',
    password: '123456'
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');

    if (mode === 'login') {
      const result = login(loginForm.email, loginForm.password);
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      if (result.user.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      if (result.user.role === 'restaurant') {
        navigate('/restaurant', { replace: true });
        return;
      }
      navigate('/', { replace: true });
      return;
    }

    if (!registerForm.name.trim()) {
      setMessage('Vui lòng nhập họ tên');
      return;
    }
    if (registerForm.password.length < 6) {
      setMessage('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    const result = register({
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      phone: registerForm.phone.trim(),
      address: registerForm.address.trim()
    });

    if (!result.success) {
      setMessage(result.message ?? 'Không thể đăng ký tài khoản');
      return;
    }

    navigate('/', { replace: true });
  };

  const handleContinueAsGuest = () => {
    clearCart();
    logout();
    navigate('/', { replace: true });
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage('');
  };

  return (
    <div className="page auth">
      <form className="form auth-form" onSubmit={handleSubmit}>
        <div className="auth-switch">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => switchMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => switchMode('register')}
          >
            Đăng ký
          </button>
        </div>
        <div className="auth-heading">
          <h2>{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản FoodFast'}</h2>
          <p className="muted">
            {mode === 'login'
              ? 'Chọn vai trò bằng cách nhập tài khoản mock bên dưới hoặc đăng ký tài khoản khách hàng mới.'
              : 'Nhập thông tin để tạo tài khoản khách hàng và bắt đầu trải nghiệm giao đồ ăn bằng drone.'}
          </p>
        </div>
        {message && <div className="toast error">{message}</div>}
        {mode === 'login' ? (
          <>
            <div className="form-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="login-password">Mật khẩu</label>
              <input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </div>
            <button type="submit" className="primary full">
              Đăng nhập
            </button>
            <div className="muted credential-hint">
              <p>Customer: customer@foodfast.io / 123456</p>
              <p>Admin: admin@foodfast.io / admin</p>
              <p>Nhà hàng: restaurant@foodfast.io / restaurant</p>
            </div>
          </>
        ) : (
          <>
            <div className="grid two form-grid">
              <div className="form-field">
                <label htmlFor="register-name">Họ tên</label>
                <input
                  id="register-name"
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="register-phone">Số điện thoại</label>
                <input
                  id="register-phone"
                  value={registerForm.phone}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="register-address">Địa chỉ</label>
                <input
                  id="register-address"
                  value={registerForm.address}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, address: event.target.value }))
                  }
                />
              </div>
              <div className="form-field">
                <label htmlFor="register-password">Mật khẩu</label>
                <input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="register-confirm">Nhập lại mật khẩu</label>
                <input
                  id="register-confirm"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <button type="submit" className="primary full">
              Tạo tài khoản
            </button>
          </>
        )}
        <button type="button" className="link-button" onClick={handleContinueAsGuest}>
          Tiếp tục mà không đăng nhập
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
