// frontend/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './frontend/pages/LoginPage/LoginPage';
import CabinetPage from './frontend/pages/CabinetPage/CabinetPage';
import TeamPage from './frontend/pages/TeamPage/TeamPage';
import Uploads from './frontend/pages/Uploads/Uploads';
import OrganizerPage from './frontend/pages/OrganizerPage/OrganizerPage';
import DocumentsPage from './frontend/pages/DocumentsPage/DocumentsPage';
import ProtectedRoute from './frontend/components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cabinet" element={<ProtectedRoute><CabinetPage /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
        <Route path="/uploads" element={<ProtectedRoute><Uploads /></ProtectedRoute>} />
        <Route path="/uploads/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        <Route path="/organizer" element={<ProtectedRoute><OrganizerPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;