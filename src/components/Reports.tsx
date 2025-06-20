import React, { useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, Users, Vote, Award, Calendar } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';
import { Election } from '../models/Election';
import { Candidate } from '../models/Candidate';
import { PollingStation } from '../models/PollingStation';
import { ElectoralRecord } from '../models/ElectoralRecord';

export const Reports: React.FC = () => {
  const [elections] = useState<Election[]>(electoralService.getElections());
  const [candidates] = useState<Candidate[]>(electoralService.getCandidates());
  const [pollingStations] = useState<PollingStation[]>(electoralService.getPollingStations());
  const [electoralRecords] = useState<ElectoralRecord[]>(electoralService.getElectoralRecords());
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [reportType, setReportType] = useState<'general' | 'candidates' | 'stations' | 'participation'>('general');

  // Calculate general statistics
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  const totalBlankVotes = electoralRecords.reduce((sum, record) => sum + record.blankVotes, 0);
  const totalNullVotes = electoralRecords.reduce((sum, record) => sum + record.nullVotes, 0);
  const totalRegisteredVoters = pollingStations.reduce((sum, station) => sum + station.registeredVoters, 0);
  const totalEffectiveVotes = totalVotes + totalBlankVotes + totalNullVotes;
  const participationRate = totalRegisteredVoters > 0 ? (totalEffectiveVotes / totalRegisteredVoters) * 100 : 0;

  // Get top candidates
  const topCandidates = [...candidates]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  // Get station statistics
  const stationStats = pollingStations.map(station => {
    const stationRecords = electoralRecords.filter(record => record.pollingStation.id === station.id);
    const stationVotes = stationRecords.reduce((sum, record) => sum + record.getTotalValidVotes(), 0);
    const stationBlankVotes = stationRecords.reduce((sum, record) => sum + record.blankVotes, 0);
    const stationNullVotes = stationRecords.reduce((sum, record) => sum + record.nullVotes, 0);
    const stationTotalVotes = stationVotes + stationBlankVotes + stationNullVotes;
    
    return {
      station,
      totalVotes: stationTotalVotes,
      validVotes: stationVotes,
      blankVotes: stationBlankVotes,
      nullVotes: stationNullVotes,
      participationRate: station.registeredVoters > 0 ? (stationTotalVotes / station.registeredVoters) * 100 : 0
    };
  });

  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF or Excel file
    const reportData = {
      timestamp: new Date().toISOString(),
      reportType,
      selectedElection,
      generalStats: {
        totalVotes,
        totalBlankVotes,
        totalNullVotes,
        totalRegisteredVoters,
        participationRate
      },
      candidates: topCandidates,
      stations: stationStats
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `reporte_electoral_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderGeneralReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votos</p>
              <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Participación</p>
              <p className="text-2xl font-bold text-gray-900">{participationRate.toFixed(1)}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Votos Blancos</p>
              <p className="text-2xl font-bold text-gray-900">{totalBlankVotes.toLocaleString()}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Votos Nulos</p>
              <p className="text-2xl font-bold text-gray-900">{totalNullVotes.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Elections Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Elecciones</h3>
        <div className="space-y-4">
          {elections.map(election => (
            <div key={election.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">{election.name}</h4>
                  <p className="text-sm text-gray-600">
                    {election.date.toLocaleDateString('es-ES')} • {election.electionType}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{election.getTotalVotes()}</p>
                <p className="text-sm text-gray-600">votos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCandidatesReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking de Candidatos</h3>
        <div className="space-y-4">
          {topCandidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
            return (
              <div key={candidate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{candidate.getFullName()}</h4>
                    <p className="text-sm text-gray-600">
                      {candidate.politicalParty.acronym} • {candidate.position}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{candidate.votes.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                  {candidate.preferentialVotes > 0 && (
                    <p className="text-xs text-orange-600">
                      {candidate.preferentialVotes} preferenciales
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidates by Party */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Votos por Partido</h3>
        <div className="space-y-4">
          {Array.from(new Set(candidates.map(c => c.politicalParty.id)))
            .map(partyId => {
              const partyCandidates = candidates.filter(c => c.politicalParty.id === partyId);
              const partyVotes = partyCandidates.reduce((sum, c) => sum + c.votes, 0);
              const party = partyCandidates[0]?.politicalParty;
              const percentage = totalVotes > 0 ? (partyVotes / totalVotes) * 100 : 0;
              
              return party ? (
                <div key={partyId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">{party.acronym}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{party.name}</h4>
                      <p className="text-sm text-gray-600">{partyCandidates.length} candidatos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{partyVotes.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ) : null;
            })}
        </div>
      </div>
    </div>
  );

  const renderStationsReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporte por Mesa Electoral</h3>
        <div className="space-y-4">
          {stationStats.map(stat => (
            <div key={stat.station.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">Mesa {stat.station.stationNumber}</h4>
                  <p className="text-sm text-gray-600">{stat.station.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{stat.participationRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">participación</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Registrados</p>
                  <p className="text-lg font-bold text-gray-900">{stat.station.registeredVoters}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Válidos</p>
                  <p className="text-lg font-bold text-green-600">{stat.validVotes}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Blancos</p>
                  <p className="text-lg font-bold text-gray-600">{stat.blankVotes}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Nulos</p>
                  <p className="text-lg font-bold text-red-600">{stat.nullVotes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParticipationReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Participación</h3>
        
        {/* Overall Participation */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Participación General</h4>
              <p className="text-sm text-gray-600">
                {totalEffectiveVotes.toLocaleString()} de {totalRegisteredVoters.toLocaleString()} votantes registrados
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{participationRate.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="mt-3 bg-white rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(participationRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Participation by Station */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Participación por Mesa</h4>
          <div className="space-y-3">
            {stationStats
              .sort((a, b) => b.participationRate - a.participationRate)
              .map(stat => (
                <div key={stat.station.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Mesa {stat.station.stationNumber}</span>
                    <p className="text-sm text-gray-600">{stat.station.location}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {stat.totalVotes} / {stat.station.registeredVoters}
                      </p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(stat.participationRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">
                      {stat.participationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del sistema electoral</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Reporte
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">Reporte General</option>
              <option value="candidates">Reporte de Candidatos</option>
              <option value="stations">Reporte por Mesa</option>
              <option value="participation">Análisis de Participación</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elección
            </label>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las Elecciones</option>
              {elections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'general' && renderGeneralReport()}
      {reportType === 'candidates' && renderCandidatesReport()}
      {reportType === 'stations' && renderStationsReport()}
      {reportType === 'participation' && renderParticipationReport()}
    </div>
  );
};