// frontend/src/frontend/pages/CabinetPage/CabinetPage.tsx — ЗАМЕНИТЕ текущий файл

import React from 'react';
import Header from '../../components/Header/Header';
import Profile from '../../components/Profile/Profile';
import '../../components/Profile/Profile.css';

const ProfilePage: React.FC = () => {
  return (
    <div className="cabinet-page">
      <Header activePage="main" />
      <Profile />
    </div>
  );
};

export default ProfilePage;