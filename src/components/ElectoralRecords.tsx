import React, { useState } from 'react';
import { Plus, Edit, FileText, Search, Users, CheckCircle, Clock, Award } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';
import { ElectoralRecord, VoteRecord } from '../models/ElectoralRecord';
import { PollingStation } from '../models/PollingStation';
import { Candidate } from '../models/Candidate';

export const ElectoralRecords: React.FC = () => {
  const [records, setRecords] = useState<ElectoralRecord[]>(electoralService.getElectoralRecords());
  const [stations] = useState<PollingStation[]>(electoralService.getPollingStations());
  const [candidates] = useState<Candidate[]>(electoralService.getCandidates());
  const [showForm, setShowForm] = useState(false);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ElectoralRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ElectoralRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    pollingStationId: '',
    place: '',
    recordNumber: ''
  });
  const [voteData, setVoteData] = useState<{[key: string]: {votes: number, preferentialVotes: number}}>({});
  const [blankVotes, setBlankVotes] = useState(0);
  const [nullVotes, setNullVotes] = useState(0);

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordNumber.includes(searchTerm) ||
    record.place.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecord = electoralService.createElectoralRecord(
      formData.title,
      formData.pollingStationId,
      formData.place,
      formData.recordNumber
    );
    
    if (newRecord) {
      setRecords(electoralService.getElectoralRecords());
      resetForm();
    }
  };

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRecord) {
      // Add vote records for each candidate
      Object.entries(voteData).forEach(([candidateId, votes]) => {
        if (votes.votes > 0 || votes.preferentialVotes > 0) {
          selectedRecord.addVoteRecord(candidateId, votes.votes, votes.preferentialVotes);
        }
      });

      // Set blank and null votes
      selectedRecord.setBlankAndNullVotes(blankVotes, nullVotes);

      // Update candidates' vote counts
      Object.entries(voteData).forEach(([candidateId, votes]) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate && (votes.votes > 0 || votes.preferentialVotes > 0)) {
          candidate.votes += votes.votes;
          candidate.preferentialVotes += votes.preferentialVotes;
        }
      });

      setRecords([...records]);
      resetVoteForm();
    }
  };

  const handleRegisterVotes = (record: ElectoralRecord) => {
    setSelectedRecord(record);
    
    // Initialize vote data for all candidates
    const initialVoteData: {[key: string]: {votes: number, preferentialVotes: number}} = {};
    candidates.forEach(candidate => {
      const existingRecord = record.voteRecords.find(vr => vr.candidateId === candidate.id);
      initialVoteData[candidate.id] = {
        votes: existingRecord?.votes || 0,
        preferentialVotes: existingRecord?.preferentialVotes || 0
      };
    });
    
    setVoteData(initialVoteData);
    setBlankVotes(record.blankVotes);
    setNullVotes(record.nullVotes);
    setShowVoteForm(true);
  };

  const handleFinalizeRecord = (record: ElectoralRecord) => {
    if (window.confirm('¿Está seguro de que desea finalizar esta acta? No podrá modificarla después.')) {
      record.finalize('SELLO_OFICIAL_' + Date.now());
      setRecords([...records]);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      pollingStationId: '',
      place: '',
      recordNumber: ''
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const resetVoteForm = () => {
    setVoteData({});
    setBlankVotes(0);
    setNullVotes(0);
    setSelectedRecord(null);
    setShowVoteForm(false);
  };

  const updateVoteData = (candidateId: string, field: 'votes' | 'preferentialVotes', value: number) => {
    setVoteData(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actas Electorales</h1>
          <p className="text-gray-600">Registre y gestione las actas electorales</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Acta Electoral
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar actas electorales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Record Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Acta Electoral</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Acta
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesa Electoral
                </label>
                <select
                  value={formData.pollingStationId}
                  onChange={(e) => setFormData({ ...formData, pollingStationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar mesa</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      Mesa {station.stationNumber} - {station.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar
                </label>
                <input
                  type="text"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Acta
                </label>
                <input
                  type="text"
                  value={formData.recordNumber}
                  onChange={(e) => setFormData({ ...formData, recordNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vote Registration Modal */}
      {showVoteForm && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Votos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Acta: {selectedRecord.title} - Mesa {selectedRecord.pollingStation.stationNumber}
              </p>
            </div>
            
            <form onSubmit={handleVoteSubmit} className="p-6 space-y-6">
              {/* Candidates Votes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Votos por Candidato</h3>
                <div className="space-y-4">
                  {candidates.map(candidate => (
                    <div key={candidate.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{candidate.getFullName()}</h4>
                          <p className="text-sm text-gray-600">
                            {candidate.politicalParty.acronym} - {candidate.position}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Votos Regulares
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={voteData[candidate.id]?.votes || 0}
                            onChange={(e) => updateVoteData(candidate.id, 'votes', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Votos Preferenciales
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={voteData[candidate.id]?.preferentialVotes || 0}
                            onChange={(e) => updateVoteData(candidate.id, 'preferentialVotes', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blank and Null Votes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votos en Blanco
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={blankVotes}
                    onChange={(e) => setBlankVotes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votos Nulos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={nullVotes}
                    onChange={(e) => setNullVotes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetVoteForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Registrar Votos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-sm text-gray-600">Acta #{record.recordNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {record.isFinalized ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Mesa:</span>
                <p className="text-sm text-gray-600">
                  {record.pollingStation.stationNumber} - {record.pollingStation.location}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Lugar:</span>
                <p className="text-sm text-gray-600">{record.place}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Fecha:</span>
                  <p className="text-sm text-gray-600">
                    {record.date.toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Hora:</span>
                  <p className="text-sm text-gray-600">{record.time}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-700">Válidos</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{record.getTotalValidVotes()}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-xs font-medium text-gray-700">Blancos</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">{record.blankVotes}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-xs font-medium text-gray-700">Nulos</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">{record.nullVotes}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Participación:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {record.getTurnoutPercentage().toFixed(1)}%
                </span>
              </div>

              {!record.isFinalized && (
                <div className="flex space-x-2 pt-3">
                  <button
                    onClick={() => handleRegisterVotes(record)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    Registrar Votos
                  </button>
                  {record.getTotalValidVotes() > 0 && (
                    <button
                      onClick={() => handleFinalizeRecord(record)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              )}

              {record.isFinalized && (
                <div className="pt-3">
                  <div className="flex items-center justify-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Acta Finalizada</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actas electorales</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron actas que coincidan con la búsqueda.' : 'Comience creando la primera acta electoral.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Acta
            </button>
          )}
        </div>
      )}
    </div>
  );
};