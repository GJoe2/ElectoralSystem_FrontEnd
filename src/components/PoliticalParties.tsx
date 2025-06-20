import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building, Search } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';
import { PoliticalParty } from '../models/PoliticalParty';

export const PoliticalParties: React.FC = () => {
  const [parties, setParties] = useState<PoliticalParty[]>(electoralService.getPoliticalParties());
  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<PoliticalParty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    legalRepresentative: '',
    logo: ''
  });

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.acronym.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingParty) {
      electoralService.updatePoliticalParty(editingParty.id, formData);
    } else {
      electoralService.createPoliticalParty(
        formData.name,
        formData.acronym,
        formData.legalRepresentative,
        formData.logo
      );
    }
    
    setParties(electoralService.getPoliticalParties());
    resetForm();
  };

  const handleEdit = (party: PoliticalParty) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      acronym: party.acronym,
      legalRepresentative: party.legalRepresentative,
      logo: party.logo
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este partido político?')) {
      electoralService.deletePoliticalParty(id);
      setParties(electoralService.getPoliticalParties());
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      acronym: '',
      legalRepresentative: '',
      logo: ''
    });
    setEditingParty(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partidos Políticos</h1>
          <p className="text-gray-600">Gestione los partidos políticos del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Partido
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar partidos..."
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
                {editingParty ? 'Editar Partido' : 'Nuevo Partido Político'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Partido
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
                  Sigla
                </label>
                <input
                  type="text"
                  value={formData.acronym}
                  onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Representante Legal
                </label>
                <input
                  type="text"
                  value={formData.legalRepresentative}
                  onChange={(e) => setFormData({ ...formData, legalRepresentative: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (URL)
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/logo.png"
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
                  {editingParty ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map((party) => (
          <div key={party.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {party.logo ? (
                    <img src={party.logo} alt={party.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Building className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{party.acronym}</h3>
                  <p className="text-sm text-gray-600">{party.name}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(party)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(party.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Representante:</span>
                <p className="text-sm text-gray-600">{party.legalRepresentative}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Fundado:</span>
                <p className="text-sm text-gray-600">
                  {new Date(party.foundedDate).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  party.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {party.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredParties.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partidos políticos</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron partidos que coincidan con la búsqueda.' : 'Comience creando el primer partido político.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Partido
            </button>
          )}
        </div>
      )}
    </div>
  );
};