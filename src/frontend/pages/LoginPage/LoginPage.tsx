// frontend/src/frontend/pages/LoginPage/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, saveToken, saveUser } from '../../../api/auth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    organization: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone || undefined,
            city: formData.city || undefined,
            organization: formData.organization || undefined,
          });

      saveToken(result.token);
      saveUser(result.user);

      // Редирект по роли
      const { role } = result.user;
      if (role === 'ORGANIZER') {
        navigate('/organizer');
      } else if (role === 'JUDGE') {
        navigate('/judge');
      } else {
        navigate('/cabinet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="login-page">
      <h1 className="page-title">Кабинет участника</h1>
      <div className="login-container">
        <div className="toggle-container">
          <div className="toggle-switch">
            <button className={`toggle-option ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(null); }}>
              Вход
            </button>
            <button className={`toggle-option ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(null); }}>
              Регистрация
            </button>
            <div className={`toggle-slider ${isLogin ? 'left' : 'right'}`}></div>
          </div>
        </div>

        {error && (
          <div style={{
            color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">ФИО</label>
              <input id="fullName" className="input" type="text"
                value={formData.fullName} onChange={handleChange}
                placeholder="Введите ваше ФИО" required={!isLogin} />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email"
              value={formData.email} onChange={handleChange}
              placeholder="Введите ваш email" required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input id="phone" className="input" type="tel"
                  value={formData.phone} onChange={handleChange}
                  placeholder="Введите ваш телефон" />
              </div>
              <div className="form-group">
                <label htmlFor="city">Город</label>
                <input id="city" className="input" type="text"
                  value={formData.city} onChange={handleChange}
                  placeholder="Введите ваш город" />
              </div>
              <div className="form-group">
                <label htmlFor="organization">Учреждение / организация</label>
                <input id="organization" className="input" type="text"
                  value={formData.organization} onChange={handleChange}
                  placeholder="Введите ваше учреждение или организацию" />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input id="password" className="input" type="password"
              value={formData.password} onChange={handleChange}
              placeholder="Введите ваш пароль" required />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;