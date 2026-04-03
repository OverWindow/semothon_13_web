import React, { useState } from 'react';

export default function Evaluation({ room, onBack }) {
  const members = room.members || [];

  // 평가 항목 (열) 상태 관리
  const [criteria, setCriteria] = useState([
    { id: 'c1', name: '참여도' },
    { id: 'c2', name: '자료 품질' },
    { id: 'c3', name: '발표력' },
  ]);

  // 점수 상태 관리: 키는 `${member_id}_${criterion_id}` 형태
  const [scores, setScores] = useState({});

  // 평가 항목 이름 변경
  const handleCriterionNameChange = (id, newName) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  // 평가 항목 추가
  const handleAddCriterion = () => {
    const newId = `c${Date.now()}`;
    setCriteria([...criteria, { id: newId, name: '새 항목' }]);
  };

  // 평가 항목 삭제
  const handleRemoveCriterion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
    // 삭제된 항목의 점수 데이터 초기화
    const newScores = { ...scores };
    Object.keys(newScores).forEach(key => {
      if (key.endsWith(`_${id}`)) delete newScores[key];
    });
    setScores(newScores);
  };

  // 점수 입력
  const handleScoreChange = (memberId, criterionId, val) => {
    const parsed = parseInt(val, 10);
    const scoreVal = isNaN(parsed) ? '' : Math.max(0, Math.min(100, parsed)); // 0~100 사이
    setScores({
      ...scores,
      [`${memberId}_${criterionId}`]: scoreVal
    });
  };

  // 개별 팀원 점수 계산 로직
  const getMemberStats = (memberId) => {
    // 값이 입력된 기준만 골라서 평균 계산 (입력 안 한 건 0점 처리할지 말지 결정)
    // 여기선 일단 칸이 있으면 0점으로 기본 산정하여 엄격히 평균을 냅니다.
    const memberScores = criteria.map(c => Number(scores[`${memberId}_${c.id}`]) || 0);
    const total = memberScores.reduce((sum, val) => sum + val, 0);
    const avg = criteria.length > 0 ? (total / criteria.length).toFixed(1) : 0;
    return { total, avg };
  };

  return (
    <div className="evaluation-container">
      <div className="team-detail-header">
        <button onClick={onBack} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20" style={{ marginRight: '6px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          팀 상세화면으로 돌아가기
        </button>
        <h1 className="detail-title">{room.title} - 개별 채점</h1>
        <p style={{ color: 'var(--subtitle-color)', fontWeight: 500, margin: '8px 0 24px' }}>
          표 방식(Table)으로 변경되었습니다. 열(항목)의 이름을 자유롭게 바꾸거나 새로 추가하여 각 팀원별로 점수를 매겨보세요!
        </p>
      </div>

      <div className="eval-table-wrapper">
        <table className="eval-table">
          <thead>
            <tr>
              <th className="sticky-col-left name-col">팀원 이름</th>
              <th className="role-col">역할</th>
              {criteria.map((c) => (
                <th key={c.id} className="criterion-col">
                  <div className="th-criterion-header">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => handleCriterionNameChange(c.id, e.target.value)}
                      className="eval-th-input"
                      placeholder="항목명"
                    />
                    {criteria.length > 1 && (
                      <button onClick={() => handleRemoveCriterion(c.id)} className="eval-th-remove" title="항목 열 삭제">&times;</button>
                    )}
                  </div>
                </th>
              ))}
              <th className="add-col">
                <button onClick={handleAddCriterion} className="eval-th-add-btn">+ 항목 추가</button>
              </th>
              <th className="stat-col sticky-col-right-2">총점</th>
              <th className="stat-col sticky-col-right-1 highlight-th">평균</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={criteria.length + 5} style={{ textAlign: 'center', padding: '40px', color: 'var(--subtitle-color)' }}>
                  채점할 팀원이 없습니다.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const stats = getMemberStats(m.user_id);
                return (
                  <tr key={m.user_id}>
                    <td className="sticky-col-left member-name-td">
                      <div className="member-name-flex">
                        <div className="avatar-small">
                          {(m.display_name || m.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        {m.display_name || m.username}
                      </div>
                    </td>
                    <td className="member-role-td">{m.role_in_room || '-'}</td>

                    {criteria.map((c) => (
                      <td key={c.id} className="input-td">
                        <input
                          type="number"
                          value={scores[`${m.user_id}_${c.id}`] !== undefined ? scores[`${m.user_id}_${c.id}`] : ''}
                          onChange={(e) => handleScoreChange(m.user_id, c.id, e.target.value)}
                          className="eval-td-input"
                          placeholder="0"
                          min="0" max="100"
                        />
                      </td>
                    ))}

                    <td className="empty-td"></td>
                    <td className="stat-val-td sticky-col-right-2">{stats.total}</td>
                    <td className="stat-val-td highlight-td sticky-col-right-1">{stats.avg}점</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="eval-table-footer">
        <button className="action-btn eval-save-btn" onClick={() => alert('팀원별 성적 저장이 완료되었습니다!')}>평가 완료 및 저장하기</button>
      </div>
    </div>
  );
}
