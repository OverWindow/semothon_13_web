import React, { useState, useEffect } from 'react';
import TeamDetail from './TeamDetail';

export default function Dashboard({ setAuth }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // 로컬스토리지에서 로그인된 유저 정보 가져오기
  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || ''; 
      
      const response = await fetch('https://semothon13app-production.up.railway.app/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setAuth(false);
        return;
      }

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
  };

  const filteredData = rooms.filter((room) => {
    const titleMatch = room.title?.includes(searchTerm) || false;
    const descMatch = room.description?.includes(searchTerm) || false;
    const hostMatch = room.host_name?.includes(searchTerm) || false;
    return titleMatch || descMatch || hostMatch;
  });

  const getProgressPercent = (stage) => {
    if (!stage) return 0;
    if (!isNaN(stage)) {
      const num = Number(stage);
      return num <= 100 ? num : Math.min(100, num * 20); 
    }
    return 50; 
  };

  return (
    <div className="dashboard-container">
      {/* 🔹 공통 상단 헤더 */}
      <header className="dashboard-header">
        <div className="header-titles">
          <h1 className="title">조교 KHU</h1>
          <p className="subtitle">데이터분석캡스톤디자인 01분반</p>
        </div>
        
        <div className="header-actions">
          {/* 목록 화면일 때만 검색창 표시 */}
          {!selectedRoom && (
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
          )}

          {/* 프로필 & 로그아웃 위젯 */}
          <div className="user-profile-widget">
            <div className="avatar">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.username || '관리자'}</span>
              <button onClick={handleLogout} className="logout-btn">로그아웃</button>
            </div>
          </div>
        </div>
      </header>

      {/* 🔹 메인 컨텐츠 영역 */}
      <main className="dashboard-main-area">
        {selectedRoom ? (
          <TeamDetail 
            room={selectedRoom} 
            onBack={() => setSelectedRoom(null)} 
          />
        ) : (
          <div className="dashboard-grid">
            {loading && <div style={{width: '100%', textAlign: 'center'}}>로딩 중...</div>}
            {error && <div style={{width: '100%', textAlign: 'center', color: 'var(--primary-color)'}}>{error}</div>}
            
            {!loading && !error && filteredData.map((room) => {
              const progress = getProgressPercent(room.current_stage);
              
              return (
                <div 
                  key={room.id} 
                  className="team-card group clickable" 
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="team-card-inner">
                    <div className="team-header">
                      <div className="team-name-wrapper">
                        <h2 className="team-name">{room.title}</h2>
                        {progress === 100 && <span className="status-badge completed">완료됨</span>}
                        {progress < 100 && progress > 0 && <span className="status-badge in-progress">진행중</span>}
                        {progress === 0 && <span className="status-badge pending">대기중</span>}
                      </div>
                      <div className="menu-dot"></div>
                    </div>

                    <div className="team-content">
                      <div className="info-group">
                        <span className="info-label">팀장</span>
                        <span className="info-value leader">{room.host_name}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">팀원</span>
                        <span className="info-value members">
                          {room.member_count} / {room.max_members} 명
                        </span>
                      </div>

                      <div className="info-group topic-wrapper">
                        <span className="info-label">주제</span>
                        <div className="topic-card">
                          <p className="topic-text">{room.description || '주제 미정'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="team-footer">
                    <div className="progress-info">
                      <span className="progress-label">
                        진행도 {room.current_stage && `(${room.current_stage})`}
                      </span>
                      <span className="progress-percent" style={{ color: progress === 100 ? 'var(--primary-color)' : 'var(--text-main)' }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="progress-track" title={`${progress}% 완료`}>
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      >
                        <div className="progress-glow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!loading && !error && filteredData.length === 0 && (
              <div style={{width: '100%', textAlign: 'center', gridColumn: '1 / -1', padding: '40px'}}>
                참여 중인 팀이 없습니다.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

