import React from 'react';

// API 연동 전 사용할 팀원 Mock Data
const MOCK_MEMBERS = [
  { 
    id: 1, 
    name: '표지훈', 
    role: '자료조사, 발표', 
    progress: 33, 
    todos: [
      { id: 1, text: '할일 1', done: false }, 
      { id: 2, text: '할일 2', done: false }, 
      { id: 3, text: '할일 3', done: true }
    ] 
  },
  { 
    id: 2, 
    name: '김현진', 
    role: '자료조사, 발표', 
    progress: 33, 
    todos: [
      { id: 1, text: '할일 1', done: false }, 
      { id: 2, text: '할일 2', done: false }, 
      { id: 3, text: '할일 3', done: true }
    ] 
  },
  { 
    id: 3, 
    name: '황윤성', 
    role: '자료조사, 발표', 
    progress: 33, 
    todos: [
      { id: 1, text: '할일 1', done: false }, 
      { id: 2, text: '할일 2', done: false }, 
      { id: 3, text: '할일 3', done: true }
    ] 
  },
  { 
    id: 4, 
    name: '이우성', 
    role: '자료조사, 발표', 
    progress: 33, 
    todos: [
      { id: 1, text: '할일 1', done: false }, 
      { id: 2, text: '할일 2', done: false }, 
      { id: 3, text: '할일 3', done: true }
    ] 
  },
];

export default function TeamDetail({ room, onBack }) {
  return (
    <div className="team-detail-container">
      <div className="team-detail-header">
        <button onClick={onBack} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20" style={{marginRight: '6px'}}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로 돌아가기
        </button>
        
        <h1 className="detail-title">{room.title}</h1>
        
        <div className="detail-info-box">
          <p className="detail-topic">주제: '{room.description || '주제 미정'}'</p>
          <p className="detail-status">진행 현황: {room.current_stage || '대기중'}</p>
        </div>
      </div>

      <div className="member-grid">
         {MOCK_MEMBERS.map(member => (
            <div key={member.id} className="member-card">
               <h2 className="member-name">{member.name}</h2>
               <div className="member-meta">
                 <p className="member-role">{member.role}</p>
                 <p className="member-progress">진행률: <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>{member.progress}%</span></p>
               </div>
               
               <h3 className="todo-heading">To-Do list</h3>
               <ul className="todo-list">
                 {member.todos.map(todo => (
                   <li key={todo.id} className={todo.done ? 'todo-done' : ''}>
                     {todo.id}. {todo.text}
                   </li>
                 ))}
               </ul>
            </div>
         ))}
      </div>
    </div>
  );
}
