import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckComplete, setIsCheckComplete] = useState(false);

  useEffect(() => {
    // 앱 초기 실행 시 토큰 존재 여부 확인
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsCheckComplete(true);
  }, []);

  if (!isCheckComplete) return null;

  return (
    <>
      {isAuthenticated ? (
        <Dashboard setAuth={setIsAuthenticated} />
      ) : (
        <Login setAuth={setIsAuthenticated} />
      )}
    </>
  );
}

export default App;

