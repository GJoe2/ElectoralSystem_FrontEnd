import React from 'react';
import { Users, Vote, Building, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const elections = electoralService.getElections();
  const candidates = electoralService.getCandidates();
  const parties = electoralService.getPoliticalParties();
  const pollingStations = electoralService.getPollingStations();
  const records = electoralService.getElectoralRecords();

  const activeElections = elections.filter(e => !e.isFinalized);
  const completedElections = elections.filter(e => e.isFinalized);

  const stats = [
    {
      title: 'Elecciones Activas',
      value: activeElections.length,
      icon: Vote,
      color: 'bg-blue-500',
      onClick: () => onTabChange('elections')
    },
    {
      title: 'Total Candidatos',
      value: candidates.length,
      icon: Users,
      color: 'bg-green-500',
      onClick: () => onTabChange('candidates')
    },
    {
      title: 'Partidos Políticos',
      value: parties.length,
      icon: Building,
      color: 'bg-purple-500',
      onClick: () => onTabChange('parties')
    },
    {
      title: 'Mesas Electorales',
      value: pollingStations.length,
      icon: FileText,
      color: 'bg-orange-500',
      onClick: () => onTabChange('polling-stations')
    }
  ];

  const recentElections = elections.slice(-3).reverse();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bienvenido al Sistema Electoral</h1>
        <p className="text-blue-100">
          Gestione elecciones, candidatos y procesos electorales de manera eficiente y transparente.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Elections */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Elecciones Recientes</h2>
            <button
              onClick={() => onTabChange('elections')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas
            </button>
          </div>
          
          <div className="space-y-3">
            {recentElections.length > 0 ? (
              recentElections.map((election) => (
                <div key={election.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{election.name}</h3>
                    <p className="text-sm text-gray-600">
                      {election.date.toLocaleDateString('es-ES')} • {election.electionType}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {election.isFinalized ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Vote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay elecciones registradas</p>
                <button
                  onClick={() => onTabChange('elections')}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Crear primera elección
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => onTabChange('elections')}
              className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              <Vote className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Nueva Elección</span>
            </button>
            
            <button
              onClick={() => onTabChange('candidates')}
              className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Registrar Candidato</span>
            </button>
            
            <button
              onClick={() => onTabChange('parties')}
              className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
            >
              <Building className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-medium">Nuevo Partido</span>
            </button>

            <button
              onClick={() => onTabChange('records')}
              className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
            >
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="text-orange-700 font-medium">Registrar Votos</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Sistema Operativo</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Base de Datos Conectada</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{records.length} Actas Registradas</span>
          </div>
        </div>
      </div>
    </div>
  );
};