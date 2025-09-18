import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';

interface User {
  studentId: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (studentId: string, name: string) => {
    setUser({ studentId, name });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      studentName={user.name}
      studentId={user.studentId}
      onLogout={handleLogout}
    />
  );
}