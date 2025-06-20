import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Search, MapPin, Users, UserCheck } from 'lucide-react';
import { electoralService } from '../services/ElectoralService';
import { PollingStation } from '../models/PollingStation';
import { PollingStationMember } from '../models/PollingStationMember';
import { MemberType } from '../types/interfaces';

export const PollingStations: React.FC = () => {
  const [stations, setStations] = useState<PollingStation[]>(electoralService.getPollingStations());
  const [showForm, setShowForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingStation, setEditingStation] = useState<PollingStation | null>(null);
  const [selectedStation, setSelectedStation] = useState<PollingStation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    stationNumber: '',
    location: '',
    address: '',
    registeredVoters: 0
  });
  const [memberFormData, setMemberFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    memberType: 'vocal' as MemberType,
    phoneNumber: '',
    email: ''
  });

  const filteredStations = stations.filter(station =>
    station.stationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStation) {
      electoralService.updatePollingStation(editingStation.id, formData);
    } else {
      electoralService.createPollingStation(
        formData.stationNumber,
        formData.location,
        formData.address,
        formData.registeredVoters
      );
    }
    
    setStations(electoralService.getPollingStations());
    resetForm();
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStation) {
      const member = electoralService.createPollingStationMember(
        memberFormData.firstName,
        memberFormData.lastName,
        memberFormData.dni,
        memberFormData.memberType,
        memberFormData.phoneNumber,
        memberFormData.email
      );
      
      selectedStation.addMember(member);
      setStations([...stations]);
      resetMemberForm();
    }
  };

  const handleEdit = (station: PollingStation) => {
    setEditingStation(station);
    setFormData({
      stationNumber: station.stationNumber,
      location: station.location,
      address: station.address,
      registeredVoters: station.registeredVoters
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta mesa electoral?')) {
      electoralService.deletePollingStation(id);
      setStations(electoralService.getPollingStations());
    }
  };

  const handleAddMember = (station: PollingStation) => {
    setSelectedStation(station);
    setShowMemberForm(true);
  };

  const handleRemoveMember = (station: PollingStation, memberType: MemberType) => {
    if (window.confirm(`¿Está seguro de que desea remover al ${memberType}?`)) {
      station.removeMember(memberType);
      setStations([...stations]);
    }
  };

  const resetForm = () => {
    setFormData({
      stationNumber: '',
      location: '',
      address: '',
      registeredVoters: 0
    });
    setEditingStation(null);
    setShowForm(false);
  };

  const resetMemberForm = () => {
    setMemberFormData({
      firstName: '',
      lastName: '',
      dni: '',
      memberType: 'vocal',
      phoneNumber: '',
      email: ''
    });
    setSelectedStation(null);
    setShowMemberForm(false);
  };

  const getMemberTypeLabel = (type: MemberType) => {
    const labels = {
      'presidente': 'Presidente',
      'secretario': 'Secretario',
      'vocal': 'Vocal'
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesas Electorales</h1>
          <p className="text-gray-600">Gestione las mesas electorales y sus miembros</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Mesa Electoral
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar mesas electorales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Station Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingStation ? 'Editar Mesa Electoral' : 'Nueva Mesa Electoral'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Mesa
                </label>
                <input
                  type="text"
                  value={formData.stationNumber}
                  onChange={(e) => setFormData({ ...formData, stationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votantes Registrados
                </label>
                <input
                  type="number"
                  value={formData.registeredVoters}
                  onChange={(e) => setFormData({ ...formData, registeredVoters: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
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
                  {editingStation ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Form Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar Miembro de Mesa
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Mesa: {selectedStation?.stationNumber}
              </p>
            </div>
            
            <form onSubmit={handleMemberSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres
                </label>
                <input
                  type="text"
                  value={memberFormData.firstName}
                  onChange={(e) => setMemberFormData({ ...memberFormData, firstName: e.target.value })}
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
                  value={memberFormData.lastName}
                  onChange={(e) => setMemberFormData({ ...memberFormData, lastName: e.target.value })}
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
                  value={memberFormData.dni}
                  onChange={(e) => setMemberFormData({ ...memberFormData, dni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Miembro
                </label>
                <select
                  value={memberFormData.memberType}
                  onChange={(e) => setMemberFormData({ ...memberFormData, memberType: e.target.value as MemberType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="presidente">Presidente</option>
                  <option value="secretario">Secretario</option>
                  <option value="vocal">Vocal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={memberFormData.phoneNumber}
                  onChange={(e) => setMemberFormData({ ...memberFormData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetMemberForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStations.map((station) => (
          <div key={station.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mesa {station.stationNumber}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{station.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(station)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(station.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Dirección:</span>
                <p className="text-sm text-gray-600">{station.address}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Votantes Registrados:</span>
                <span className="text-sm font-semibold text-gray-900">{station.registeredVoters}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Participación:</span>
                <span className="text-sm text-gray-600">
                  {station.getTurnoutPercentage().toFixed(1)}%
                </span>
              </div>

              {/* Members Section */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Miembros de Mesa:</span>
                  <button
                    onClick={() => handleAddMember(station)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="space-y-2">
                  {station.members.length > 0 ? (
                    station.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {member.getFullName()}
                            </span>
                            <p className="text-xs text-gray-600">
                              {getMemberTypeLabel(member.memberType)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(station, member.memberType)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs text-gray-500">Sin miembros asignados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mesas electorales</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron mesas que coincidan con la búsqueda.' : 'Comience creando la primera mesa electoral.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Mesa
            </button>
          )}
        </div>
      )}
    </div>
  );
};