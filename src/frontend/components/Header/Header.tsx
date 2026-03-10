// frontend/src/frontend/components/Header/Header.tsx — ЗАМЕНИТЕ текущий файл

import React from 'react';
import { getUser, logout, statusLabel, getInitials } from '../../../api/auth';
import './Header.css';

interface HeaderProps {
  activePage: 'main' | 'team' | 'uploads' | 'results' | 'profile';
}

const Header: React.FC<HeaderProps> = ({ activePage }) => {
  const user = getUser();
  const userName = user?.fullName ?? 'Пользователь';
  const userStatus = statusLabel[user?.status ?? 'PENDING'];
  const userInitials = getInitials(userName);

  return (
    <header className="cabinet-header">
      <h1 className="page-title">Кабинет участника</h1>
      <div className="header-nav">
        <nav className="main-nav">
          <a href="/cabinet"  className={`nav-link ${activePage === 'main'    ? 'active' : ''}`}>Главная</a>
          <a href="/team"     className={`nav-link ${activePage === 'team'    ? 'active' : ''}`}>Моя команда</a>
          <a href="/uploads"  className={`nav-link ${activePage === 'uploads' ? 'active' : ''}`}>Загрузки</a>
          <a href="/results"  className={`nav-link ${activePage === 'results' ? 'active' : ''}`}>Результаты</a>
          <a href="/profile"  className={`nav-link ${activePage === 'profile' ? 'active' : ''}`}>Профиль</a>
          <button
            className="nav-link"
            onClick={logout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
          >
            Выйти
          </button>
        </nav>
        <div className="user-profile">
          <div className="user-avatar">{userInitials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-status">{userStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;