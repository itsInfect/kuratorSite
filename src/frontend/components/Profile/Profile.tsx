// Profile.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyUploads, type MyUploads } from '../../../api/uploads';
import { getMyTeam, type Team } from '../../../api/teams';
import "./Profile.css";

const Profile: React.FC = () => {
  const [uploads, setUploads] = useState<MyUploads | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyUploads().then(setUploads).catch(console.error);
    getMyTeam().then(setTeam).catch(console.error);
  }, []);

  // Данные пользователя из скриншота (можно заменить на реальные данные из контекста/стора)
  const userData = {
    fullName: "Иван Петров",
    email: "ivan.petrov@example.com",
    phone: "+7 (999) 123-45-67",
    city: "Москва",
    organization: "Колледж гастрономии №1",
    accountStatus: "Подтверждён",
    teamStatus: "Сформирована организатором"
  };

  const trainer = team?.members.find(m => m.role === 'Тренер');

  return (
    <div className="profile">
      <main className="profile-content">
        <div className="profile-grid">
          {/* Левая колонка - Личные данные */}
          <section className="personal-section">
            <h2 className="section-title">Личные данные</h2>
            <div className="personal-card">
              <div className="personal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ФИО</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      defaultValue={userData.fullName}
                      placeholder="Введите ФИО"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      defaultValue={userData.email}
                      placeholder="Введите email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Телефон</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      defaultValue={userData.phone}
                      placeholder="Введите телефон"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Город</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      defaultValue={userData.city}
                      placeholder="Введите город"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Организация</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={userData.organization}
                    placeholder="Введите организацию"
                  />
                </div>
              </div>

              <div className="personal-actions">
                <button className="primary-btn">Сохранить</button>
                <button className="secondary-btn">Сменить пароль</button>
              </div>
            </div>
          </section>

          {/* Правая колонка - Статусы */}
          <section className="status-section">
            <h2 className="section-title">Статусы</h2>
            <div className="status-card">
              <div className="status-item">
                <div className="status-header">
                  <span className="status-label">Аккаунт</span>
                  <span className="status-badge confirmed">{userData.accountStatus}</span>
                </div>
                <p className="status-hint">Подтверждение выполняет организатор.</p>
              </div>

              <div className="status-item">
                <div className="status-header">
                  <span className="status-label">Команда</span>
                  <span className="status-badge success">Сформирована организатором</span>
                </div>
                <p className="status-hint">Если команда не отображается — сообщите организатору.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;