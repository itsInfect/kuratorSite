// frontend/src/frontend/pages/CabinetPage/CabinetPage.tsx — ЗАМЕНИТЕ текущий файл

import React from 'react';
import Header from '../../components/Header/Header';
import Cabinet from '../../components/CabinetPage/Cabinet';
import '../../components/CabinetPage/Cabinet.css';

const CabinetPage: React.FC = () => {
  return (
    <div className="cabinet-page">
      <Header activePage="main" />
      <Cabinet />
    </div>
  );
};

export default CabinetPage;