import React, { useState } from 'react';
import './App.css';

const MOCK_DATA = [
  { id: 1, name: '1조', leader: '표지훈', members: ['김현진', '황윤성'], topic: '내향인을 위한 AI 팀장 서비스', progress: 75 },
  { id: 2, name: '2조', leader: '이영희', members: ['박지민', '최수아', '정민호'], topic: '수강신청 자동화 및 알림 봇', progress: 40 },
  { id: 3, name: '3조', leader: '박동건', members: ['이다영', '강태오', '유지민'], topic: '맞춤형 건강 식단 추천 시스템', progress: 85 },
  { id: 4, name: '4조', leader: '정해인', members: ['김우빈', '이종석'], topic: '실시간 감정 분석 커뮤니티', progress: 60 },
  { id: 5, name: '5조', leader: '송혜교', members: ['전지현', '김태희', '한가인'], topic: '위치 기반 AR 핫플 가이드', progress: 20 },
  { id: 6, name: '6조', leader: '공유', members: ['이동욱', '김고은', '유인나'], topic: '숏폼 영상 자동 자막 및 요약', progress: 100 },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = MOCK_DATA.filter((team) =>
    team.name.includes(searchTerm) || team.topic.includes(searchTerm) || team.leader.includes(searchTerm)
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1 className="title">조교 KHU</h1>
          <p className="subtitle">데이터분석캡스톤디자인 01분반</p>
        </div>
        
        <div className="search-container">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="조장, 팀원, 혹은 주제 검색" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="dashboard-grid">
        {filteredData.map((team) => (
          <div key={team.id} className="team-card group">
            <div className="team-card-inner">
              <div className="team-header">
                <div className="team-name-wrapper">
                  <h2 className="team-name">{team.name}</h2>
                  {team.progress === 100 && <span className="status-badge completed">완료됨</span>}
                  {team.progress < 100 && team.progress > 0 && <span className="status-badge in-progress">진행중</span>}
                  {team.progress === 0 && <span className="status-badge pending">대기중</span>}
                </div>
                <div className="menu-dot"></div>
              </div>

              <div className="team-content">
                <div className="info-group">
                  <span className="info-label">팀장</span>
                  <span className="info-value leader">{team.leader}</span>
                </div>
                
                <div className="info-group">
                  <span className="info-label">팀원</span>
                  <span className="info-value members">{team.members.join(', ')}</span>
                </div>

                <div className="info-group topic-wrapper">
                  <span className="info-label">주제</span>
                  <div className="topic-card">
                    <p className="topic-text">{team.topic}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="team-footer">
              <div className="progress-info">
                <span className="progress-label">진행도</span>
                <span className="progress-percent" style={{ color: team.progress === 100 ? 'var(--primary-color)' : 'var(--text-main)' }}>
                  {team.progress}%
                </span>
              </div>
              <div className="progress-track" title={`${team.progress}% 완료`}>
                <div 
                  className="progress-fill" 
                  style={{ width: `${team.progress}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
