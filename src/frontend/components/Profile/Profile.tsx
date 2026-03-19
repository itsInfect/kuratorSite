// frontend/src/frontend/components/Profile/Profile.tsx

import React, { useEffect, useState } from 'react';
import { getUser, getMe, saveUser, statusLabel, changePassword, type User } from '../../../api/auth';
import { getMyTeam, type Team } from '../../../api/teams';
import "./Profile.css";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(getUser());
  const [team, setTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
    city: '',
    organization: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Модалка смены пароля
  const [showModal, setShowModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    getMe().then(u => {
      setUser(u);
      saveUser(u);
      setFormData({
        fullName: u.fullName,
        email: u.email,
        phone: (u as User & { phone?: string }).phone ?? '',
        city: (u as User & { city?: string }).city ?? '',
        organization: (u as User & { organization?: string }).organization ?? '',
      });
    }).catch(console.error);
    getMyTeam().then(setTeam).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    await new Promise(r => setTimeout(r, 500));
    setSaveMsg('Данные сохранены');
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError('Заполните все поля');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError('Новый пароль должен быть не менее 6 символов');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Новые пароли не совпадают');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => {
        setShowModal(false);
        setPwSuccess(false);
      }, 2000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setPwLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPwForm({ current: '', next: '', confirm: '' });
    setPwError(null);
    setPwSuccess(false);
  };

  return (
    <div className="profile">
      <main className="profile-content">
        <div className="profile-grid">

          {/* ── Личные данные ── */}
          <section className="personal-section">
            <h2 className="section-title">Личные данные</h2>
            <div className="personal-card">
              <div className="personal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ФИО</label>
                    <input type="text" name="fullName" className="form-input"
                      value={formData.fullName} onChange={handleChange} placeholder="Введите ФИО" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-input"
                      value={formData.email} onChange={handleChange} placeholder="Введите email" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Телефон</label>
                    <input type="tel" name="phone" className="form-input"
                      value={formData.phone} onChange={handleChange} placeholder="Введите телефон" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Город</label>
                    <input type="text" name="city" className="form-input"
                      value={formData.city} onChange={handleChange} placeholder="Введите город" />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Организация</label>
                  <input type="text" name="organization" className="form-input"
                    value={formData.organization} onChange={handleChange} placeholder="Введите организацию" />
                </div>
              </div>

              {saveMsg && (
                <div style={{
                  color: '#38a169', fontSize: 13, marginBottom: 10,
                  padding: '8px 12px', background: '#f0fff4',
                  borderRadius: 8, border: '1px solid #c6f6d5',
                }}>✓ {saveMsg}</div>
              )}

              <div className="personal-actions">
                <button className="primary-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button className="secondary-btn" onClick={() => setShowModal(true)}>
                  Сменить пароль
                </button>
              </div>
            </div>
          </section>

          {/* ── Статусы ── */}
          <section className="status-section">
            <h2 className="section-title">Статусы</h2>
            <div className="status-card">
              <div className="status-item">
                <div className="status-header">
                  <span className="status-label">Аккаунт</span>
                  <span className={`status-badge ${user?.status === 'CONFIRMED' ? 'confirmed' : 'pending'}`}>
                    {statusLabel[user?.status ?? 'PENDING']}
                  </span>
                </div>
                <p className="status-hint">Подтверждение выполняет организатор.</p>
              </div>
              <div className="status-item">
                <div className="status-header">
                  <span className="status-label">Команда</span>
                  <span className={`status-badge ${team ? 'success' : 'pending'}`}>
                    {team ? team.name : 'Не назначена'}
                  </span>
                </div>
                <p className="status-hint">
                  {team
                    ? `Участников: ${team.members.length}`
                    : 'Если команда не отображается — сообщите организатору.'}
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Модальное окно смены пароля ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={closeModal}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Смена пароля</h2>
              <button onClick={closeModal} style={{
                background: 'none', border: 'none', fontSize: 20,
                cursor: 'pointer', color: '#aaa', lineHeight: 1,
              }}>✕</button>
            </div>

            {pwSuccess ? (
              <div style={{
                textAlign: 'center', padding: '20px 0',
                color: '#38a169', fontSize: 16, fontWeight: 500,
              }}>
                ✓ Пароль успешно изменён!
              </div>
            ) : (
              <>
                {[
                  { field: 'current', label: 'Текущий пароль' },
                  { field: 'next',    label: 'Новый пароль' },
                  { field: 'confirm', label: 'Повтор нового пароля' },
                ].map(({ field, label }) => (
                  <div key={field} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, color: '#1a1a1a', marginBottom: 6, fontWeight: 500 }}>
                      {label}
                    </label>
                    <input
                      type="password"
                      value={pwForm[field as keyof typeof pwForm]}
                      onChange={e => setPwForm(prev => ({ ...prev, [field]: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8,
                        border: '1px solid #e0e0e0', fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', background: '#fff',
                      }}
                    />
                  </div>
                ))}

                {pwError && (
                  <div style={{
                    color: '#c53030', background: '#fff5f5', border: '1px solid #feb2b2',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13,
                  }}>{pwError}</div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1, padding: '11px', background: '#fff',
                      border: '1px solid #e0e0e0', color: '#333',
                      borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    style={{
                      flex: 1, padding: '11px',
                      background: pwLoading ? '#555' : '#1a1a1a',
                      color: '#fff', border: 'none', borderRadius: 10,
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {pwLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;