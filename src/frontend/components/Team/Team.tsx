import React from 'react';
import './Team.css';

interface Member {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

interface TeamProps {
  teamName: string;
  members: Member[];
}

const Team: React.FC<TeamProps> = ({ teamName, members }) => {
  return (
    <div className="team-card">
      {/* Заголовок с кнопкой */}
      <div className="team-card-header">
        <h2 className="team-name">{teamName}</h2>
        <a href="/uploads" className="upload-btn" style={{ textDecoration: 'none' }}>
  Загрузить материалы
</a>
      </div>

      {/* Статус команды */}
      <div className="team-status">
        Сформирована организатором
      </div>

      {/* Список участников */}
      <div className="members-list">
        {members.map(member => (
          <div key={member.id} className="member-item">
            <div className="member-avatar">
              {member.avatar}
            </div>
            <div className="member-info">
              <div className="member-name">{member.name}</div>
              <div className="member-role">{member.role}</div>
            </div>
            <div className="member-status">
              {member.status}
            </div>
          </div>
        ))}
      </div>

      {/* Примечание внизу */}
      <div className="team-note">
        Команды формирует организатор. Если состав неверный - сообщите организатору
      </div>
    </div>
  );
};

export default Team;