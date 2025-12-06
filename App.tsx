import React, { useState } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { ViewState, User, UserStatus } from './types';

// Mock logged in user
const MOCK_CURRENT_USER: User = {
  id: '99',
  username: 'PlayerOne',
  avatar: 'https://picsum.photos/id/10/200/200',
  status: UserStatus.ONLINE,
  gameActivity: 'Just Chilling',
  level: 42,
  xp: 75,
  badges: ['🎮']
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = () => {
    setCurrentUser(MOCK_CURRENT_USER);
    setView('APP');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('LANDING');
  };

  return (
    <div className="font-sans antialiased">
      {view === 'LANDING' && (
        <Landing 
          onGetStarted={() => setView('REGISTER')} 
          onLogin={() => setView('LOGIN')} 
        />
      )}

      {view === 'LOGIN' && (
        <Auth 
          mode="LOGIN" 
          onSuccess={handleLoginSuccess}
          onSwitch={() => setView('REGISTER')}
          onBack={() => setView('LANDING')}
        />
      )}

      {view === 'REGISTER' && (
        <Auth 
          mode="REGISTER" 
          onSuccess={handleLoginSuccess}
          onSwitch={() => setView('LOGIN')}
          onBack={() => setView('LANDING')}
        />
      )}

      {view === 'APP' && currentUser && (
        <Dashboard 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;