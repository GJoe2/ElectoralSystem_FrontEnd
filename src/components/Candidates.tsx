import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Search, Building, Award } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';
import { Candidate } from '../models/Candidate';
import { PoliticalParty } from '../models/PoliticalParty';

export const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(electoralService.getCandidates());
  const [parties] = useState<PoliticalParty[]>(electoralService.getPoliticalParties());
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    politicalPartyId: '',
    position: 'Candidato'
  });

  const filteredCandidates = candidates.filter(candidate =>
    candidate.getFullName().toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.dni.includes(searchTerm) ||
    candidate.politicalParty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCandidate) {
      const party = parties.find(p => p.id === formData.politicalPartyId);
      if (party) {
        electoralService.updateCandidate(editingCandidate.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dni: formData.dni,
          politicalParty: party,
          position: formData.position
        });
      }
    } else {
      electoralService.createCandidate(
        formData.firstName,
        formData.lastName,
        formData.dni,
        formData.politicalPartyId,
        formData.position
      );
    }
    
    setCandidates(electoralService.getCandidates());
    resetForm();
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      dni: candidate.dni,
      politicalPartyId: candidate.politicalParty.id,
      position: candidate.position
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este candidato?')) {
      electoralService.deleteCandidate(id);
      setCandidates(electoralService.getCandidates());
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dni: '',
      politicalPartyId: '',
      position: 'Candidato'
    });
    setEditingCandidate(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600">Gestione los candidatos del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Candidato
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar candidatos..."
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
                {editingCandidate ? 'Editar Candidato' : 'Nuevo Candidato'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partido Político
                </label>
                <select
                  value={formData.politicalPartyId}
                  onChange={(e) => setFormData({ ...formData, politicalPartyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar partido</option>
                  {parties.map(party => (
                    <option key={party.id} value={party.id}>
                      {party.name} ({party.acronym})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Alcalde, Concejal, Diputado"
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
                  {editingCandidate ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{candidate.getFullName()}</h3>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(candidate)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(candidate.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">DNI:</span>
                <span className="text-sm text-gray-600">{candidate.dni}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{candidate.politicalParty.acronym}</span>
                  <p className="text-xs text-gray-600">{candidate.politicalParty.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Votos:</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{candidate.votes}</span>
                  {candidate.preferentialVotes > 0 && (
                    <p className="text-xs text-gray-600">
                      {candidate.preferentialVotes} preferenciales
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  candidate.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {candidate.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay candidatos</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron candidatos que coincidan con la búsqueda.' : 'Comience registrando el primer candidato.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primer Candidato
            </button>
          )}
        </div>
      )}
    </div>
  );
};