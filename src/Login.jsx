import React, { useState } from 'react';

export default function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://semothon13app-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      // 응답 예시에서 파악된 정보: fail 케이스는 success: false 형태이거나 HTTP 에러
      if (!response.ok || data.success === false) {
        throw new Error(data.message || '로그인에 실패했습니다. 아이디나 비밀번호를 확인해주세요.');
      }

      // JWT Access Token 저장 
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setAuth(true); // 로그인 상태 변경
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">AI COACH</h1>
        <p className="login-subtitle">데이터분석캡스톤디자인 01분반</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="input-group">
            <label>아이디</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
