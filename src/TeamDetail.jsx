import React, { useState, useEffect } from 'react';
import Evaluation from './Evaluation';

// 🔹 우선순위 뱃지 컴포넌트 추가
const PriorityBadge = ({ priority }) => {
  if (!priority) return null;
  const p = priority.toUpperCase();
  
  let icon = null;
  let label = '';
  let className = 'todo-priority ';

  if (p === 'HIGH') {
    icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
    className += 'priority-high';
    label = 'HIGH';
  } else if (p === 'MEDIUM') {
    icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
    className += 'priority-medium';
    label = 'MED';
  } else if (p === 'LOW') {
    icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
    className += 'priority-low';
    label = 'LOW';
  } else {
    return null;
  }

  return (
    <span className={className} title={`Priority: ${label}`}>
      {icon}
    </span>
  );
};

// API 호출 실패 또는 할 일이 없을 때 유저별로 연관성 있게 표시할 더미 테마들
const DUMMY_TODO_SETS = [
  [
    { id: 'd1', text: '주제 선정 및 기획안 초안 작성', done: true, priority: 'HIGH' },
    { id: 'd2', text: '관련 논문/자료 리서치 요약', done: true, priority: 'MEDIUM' },
    { id: 'd3', text: '중간 피드백 반영 및 기획 고도화', done: false, priority: 'HIGH' },
    { id: 'd4', text: '최종 기획서 마무으리', done: false, priority: 'LOW' }
  ],
  [
    { id: 'd1', text: '기술 스택 확정 및 환경 세팅', done: true, priority: 'HIGH' },
    { id: 'd2', text: '핵심 API 아키텍처 설계', done: true, priority: 'HIGH' },
    { id: 'd3', text: '서버 연동 및 배포 테스트', done: false, priority: 'MEDIUM' },
    { id: 'd4', text: '버그 픽스 및 최적화', done: false, priority: 'LOW' }
  ],
  [
    { id: 'd1', text: 'UI/UX 레퍼런스 조사', done: true, priority: 'LOW' },
    { id: 'd2', text: '주요 화면 스토리보드 스케치', done: true, priority: 'MEDIUM' },
    { id: 'd3', text: '메인 디자인 프로토타입 완성', done: false, priority: 'HIGH' },
    { id: 'd4', text: '그래픽 리소스 추출 및 정리', done: false, priority: 'MEDIUM' }
  ],
  [
    { id: 'd1', text: '분석용 데이터셋 수집', done: true, priority: 'HIGH' },
    { id: 'd2', text: '결측치 제거 및 데이터 전처리', done: false, priority: 'HIGH' },
    { id: 'd3', text: '탐색적 데이터 분석(EDA) 수행', done: false, priority: 'MEDIUM' },
    { id: 'd4', text: '시각화 차트 구현', done: false, priority: 'LOW' }
  ]
];

export default function TeamDetail({ room, onBack }) {
  const [roomDetail, setRoomDetail] = useState(room); // 초기값은 props로 받은 요약 정보
  const [todos, setTodos] = useState(null); // 백엔드에서 불러온 모든 유저의 TODO 배열
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        };

        // 1. 방 상세 정보 및 멤버 정보 패치
        const roomRes = await fetch(`https://semothon13app-production.up.railway.app/rooms/${room.id}`, { method: 'GET', headers });
        if (!roomRes.ok) {
          throw new Error('팀 상세 정보를 불러오는데 실패했습니다.');
        }
        const roomData = await roomRes.json();
        setRoomDetail(roomData);

        // 2. 할 일(Todo) 데이터 패치
        // 라우터의 정확한 prefix를 몰라 가장 유력한 예상 경로들을 fallback으로 탐색합니다.
        try {
          let todoRes = await fetch(`https://semothon13app-production.up.railway.app/todos/rooms/${room.id}`, { method: 'GET', headers });
          
          if (!todoRes.ok && todoRes.status === 404) {
            todoRes = await fetch(`https://semothon13app-production.up.railway.app/rooms/${room.id}/todos`, { method: 'GET', headers });
          }

          if (todoRes.ok) {
            const todoData = await todoRes.json();
            if (todoData.success && Array.isArray(todoData.todos)) {
              setTodos(todoData.todos);
            } else {
              setTodos(null);
            }
          } else {
            setTodos(null);
          }
        } catch (e) {
          console.error("Todo 데이터를 불러오는 중 오류 발생:", e);
          setTodos(null); // 네트워크 오류 시 null 유지하여 더미데이터 사용
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [room.id]);

  // 멤버별/팀 전체 진행률 계산 로직
  const calculateProgress = () => {
    if (!roomDetail || !roomDetail.members || roomDetail.members.length === 0) return { teamProgress: 0, memberStats: {} };
    
    let sumPercentages = 0;
    const memberStats = {};

    roomDetail.members.forEach(member => {
      let memberTodos = todos !== null ? todos.filter(t => t.assignee_user_id === member.user_id) : [];
      
      // 더미 폴백 로직
      if (memberTodos.length === 0) {
        const fallbackSetIndex = member.user_id % DUMMY_TODO_SETS.length;
        memberTodos = DUMMY_TODO_SETS[fallbackSetIndex];
      }

      const total = memberTodos.length;
      // API 데이터는 status === 'DONE', 더미 데이터는 done === true 속성을 판별
      const doneCount = memberTodos.filter(t => t.status === 'DONE' || t.done === true).length;
      const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

      memberStats[member.user_id] = {
        todos: memberTodos,
        progress: progress
      };

      sumPercentages += progress;
    });

    const teamProgress = Math.round(sumPercentages / roomDetail.members.length);
    return { teamProgress, memberStats };
  };

  const { teamProgress, memberStats } = calculateProgress();

  if (isEvaluating) {
    return <Evaluation room={roomDetail} onBack={() => setIsEvaluating(false)} />;
  }

  const members = roomDetail.members || [];

  return (
    <div className="team-detail-container">
      <div className="team-detail-header">
        <button onClick={onBack} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20" style={{marginRight: '6px'}}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로 돌아가기
        </button>
        
        <div className="header-row">
          <h1 className="detail-title">{roomDetail.title}</h1>
          <button className="action-btn" onClick={() => setIsEvaluating(true)}>이 팀 채점하기</button>
        </div>
        
        <div className="detail-info-box">
          <p className="detail-topic">주제: '{roomDetail.description || '주제 미정'}'</p>
          <p className="detail-status">
            진행 현황: {roomDetail.current_stage || '대기중'} 
            <span style={{marginLeft: '12px', color: 'var(--primary-color)', fontWeight: 'bold'}}>
              (팀 종합 진행률: {teamProgress}%)
            </span>
          </p>
        </div>
      </div>

      {loading && <div style={{textAlign: 'center', margin: '40px 0'}}>불러오는 중...</div>}
      {error && <div style={{textAlign: 'center', margin: '40px 0', color: 'var(--primary-color)'}}>{error}</div>}

      {!loading && !error && (
        <div className="member-grid">
           {members.map((member) => {
              const mStat = memberStats[member.user_id];
              const displayTodos = mStat ? mStat.todos : [];
              const progressPercentage = mStat ? mStat.progress : 0;

              return (
                <div key={member.user_id} className="member-card">
                   <h2 className="member-name">{member.display_name || member.username}</h2>
                   <div className="member-meta">
                     <p className="member-role">{member.role_in_room || '역할 미정'}</p>
                     <p className="member-progress">진행률: <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>{progressPercentage}%</span></p>
                   </div>
                   
                   <h3 className="todo-heading">To-Do list</h3>
                   <ul className="todo-list">
                     {displayTodos.map((todo, idx) => {
                       const isDone = todo.status === 'DONE' || todo.done === true;
                       const textLabel = todo.title || todo.text;
                       return (
                         <li 
                           key={todo.id || idx} 
                           className={isDone ? 'todo-done todo-item-hover' : 'todo-item-hover'}
                         >
                           <span className="todo-text">
                             <span>{idx + 1}. {textLabel}</span>
                             <PriorityBadge priority={todo.priority} />
                           </span>
                           <div className="todo-tooltip">
                             {todo.description || '상세 설명이 없습니다.'}
                           </div>
                         </li>
                       );
                     })}
                   </ul>
                </div>
              );
           })}
           {members.length === 0 && (
             <div style={{color: 'var(--subtitle-color)'}}>팀원이 아직 없습니다.</div>
           )}
        </div>
      )}
    </div>
  );
}
