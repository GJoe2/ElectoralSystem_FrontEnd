import React, { useState } from 'react';
import { Plus, Edit, Trash2, Vote, Search, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';
import { Election } from '../models/Election';
import { ElectionType } from '../types/interfaces';

export const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>(electoralService.getElections());
  const [showForm, setShowForm] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    electionType: 'municipal' as ElectionType,
    description: ''
  });

  const filteredElections = elections.filter(election =>
    election.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.electionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingElection) {
      electoralService.updateElection(editingElection.id, {
        ...formData,
        date: new Date(formData.date)
      });
    } else {
      electoralService.createElection(
        formData.name,
        new Date(formData.date),
        formData.electionType,
        formData.description
      );
    }
    
    setElections(electoralService.getElections());
    resetForm();
  };

  const handleEdit = (election: Election) => {
    setEditingElection(election);
    setFormData({
      name: election.name,
      date: election.date.toISOString().split('T')[0],
      electionType: election.electionType,
      description: election.description
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta elección?')) {
      electoralService.deleteElection(id);
      setElections(electoralService.getElections());
    }
  };

  const handleFinalize = (id: string) => {
    if (window.confirm('¿Está seguro de que desea finalizar esta elección? Esta acción no se puede deshacer.')) {
      const election = elections.find(e => e.id === id);
      if (election) {
        election.finalize();
        setElections([...elections]);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      electionType: 'municipal',
      description: ''
    });
    setEditingElection(null);
    setShowForm(false);
  };

  const getElectionTypeLabel = (type: ElectionType) => {
    const labels = {
      'municipal': 'Municipal',
      'national': 'Nacional',
      'referendum': 'Referéndum'
    };
    return labels[type];
  };

  const getElectionTypeColor = (type: ElectionType) => {
    const colors = {
      'municipal': 'bg-blue-100 text-blue-800',
      'national': 'bg-purple-100 text-purple-800',
      'referendum': 'bg-orange-100 text-orange-800'
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Elecciones</h1>
          <p className="text-gray-600">Gestione las elecciones del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Elección
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar elecciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingElection ? 'Editar Elección' : 'Nueva Elección'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Elección
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Elección
                </label>
                <select
                  value={formData.electionType}
                  onChange={(e) => setFormData({ ...formData, electionType: e.target.value as ElectionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="municipal">Municipal</option>
                  <option value="national">Nacional</option>
                  <option value="referendum">Referéndum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
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
                  {editingElection ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredElections.map((election) => (
          <div key={election.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{election.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {election.date.toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {election.isFinalized ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500" />
                )}
                <div className="flex space-x-1">
                  {!election.isFinalized && (
                    <>
                      <button
                        onClick={() => handleEdit(election)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(election.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tipo:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getElectionTypeColor(election.electionType)}`}>
                  {getElectionTypeLabel(election.electionType)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Candidatos:</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{election.candidates.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Votos:</span>
                <span className="text-sm font-semibold text-gray-900">{election.getTotalVotes()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  election.isFinalized 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {election.isFinalized ? 'Finalizada' : 'En Proceso'}
                </span>
              </div>

              {election.description && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Descripción:</span>
                  <p className="text-sm text-gray-600 mt-1">{election.description}</p>
                </div>
              )}

              {!election.isFinalized && election.getTotalVotes() > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleFinalize(election.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Finalizar Elección
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredElections.length === 0 && (
        <div className="text-center py-12">
          <Vote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay elecciones</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron elecciones que coincidan con la búsqueda.' : 'Comience creando la primera elección.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Elección
            </button>
          )}
        </div>
      )}
    </div>
  );
};