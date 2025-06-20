import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PoliticalParties } from './components/PoliticalParties';
import { Elections } from './components/Elections';
import { Candidates } from './components/Candidates';
import { PollingStations } from './components/PollingStations';
import { ElectoralRecords } from './components/ElectoralRecords';
import { Reports } from './components/Reports';
import { electoralService } from './services/ElectoralService';
import { User } from './models/User';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (in a real app, this would check for a token)
    const savedUser = electoralService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    const success = electoralService.login(username, password);
    if (success) {
      setCurrentUser(electoralService.getCurrentUser());
    }
    return success;
  };

  const handleLogout = () => {
    electoralService.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema electoral...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'parties':
        return <PoliticalParties />;
      case 'elections':
        return <Elections />;
      case 'candidates':
        return <Candidates />;
      case 'polling-stations':
        return <PollingStations />;
      case 'records':
        return <ElectoralRecords />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {renderActiveComponent()}
    </Layout>
  );
}

export default App;