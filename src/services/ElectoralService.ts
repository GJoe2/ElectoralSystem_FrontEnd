import { Election } from '../models/Election';
import { Candidate } from '../models/Candidate';
import { PoliticalParty } from '../models/PoliticalParty';
import { PollingStation } from '../models/PollingStation';
import { PollingStationMember } from '../models/PollingStationMember';
import { ElectoralRecord } from '../models/ElectoralRecord';
import { User } from '../models/User';
import { ElectionType, MemberType, UserRole } from '../types/interfaces';

export class ElectoralService {
  private elections: Election[] = [];
  private candidates: Candidate[] = [];
  private politicalParties: PoliticalParty[] = [];
  private pollingStations: PollingStation[] = [];
  private pollingStationMembers: PollingStationMember[] = [];
  private electoralRecords: ElectoralRecord[] = [];
  private users: User[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.initializeDefaultData();
    this.loadFromStorage();
  }

  // Authentication methods
  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.authenticate({ username, password }));
    if (user) {
      this.currentUser = user;
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Political Party methods
  createPoliticalParty(name: string, acronym: string, legalRepresentative: string, logo?: string): PoliticalParty {
    const party = new PoliticalParty(name, acronym, legalRepresentative, logo);
    this.politicalParties.push(party);
    this.saveToStorage();
    return party;
  }

  getPoliticalParties(): PoliticalParty[] {
    return this.politicalParties.filter(p => p.isActive);
  }

  updatePoliticalParty(id: string, updates: Partial<PoliticalParty>): boolean {
    const party = this.politicalParties.find(p => p.id === id);
    if (party) {
      party.updateInfo(updates);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deletePoliticalParty(id: string): boolean {
    const party = this.politicalParties.find(p => p.id === id);
    if (party) {
      party.deactivate();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Candidate methods
  createCandidate(firstName: string, lastName: string, dni: string, partyId: string, position?: string): Candidate | null {
    const party = this.politicalParties.find(p => p.id === partyId);
    if (!party) return null;

    const candidate = new Candidate(firstName, lastName, dni, party, position);
    this.candidates.push(candidate);
    this.saveToStorage();
    return candidate;
  }

  getCandidates(): Candidate[] {
    return this.candidates.filter(c => c.isActive);
  }

  updateCandidate(id: string, updates: Partial<Candidate>): boolean {
    const candidate = this.candidates.find(c => c.id === id);
    if (candidate) {
      candidate.updateInfo(updates);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteCandidate(id: string): boolean {
    const candidate = this.candidates.find(c => c.id === id);
    if (candidate) {
      candidate.deactivate();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Election methods
  createElection(name: string, date: Date, electionType: ElectionType, description?: string): Election {
    const election = new Election(name, date, electionType, description);
    this.elections.push(election);
    this.saveToStorage();
    return election;
  }

  getElections(): Election[] {
    return this.elections.filter(e => e.isActive);
  }

  getElectionById(id: string): Election | undefined {
    return this.elections.find(e => e.id === id && e.isActive);
  }

  updateElection(id: string, updates: Partial<Election>): boolean {
    const election = this.elections.find(e => e.id === id);
    if (election) {
      election.updateInfo(updates);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteElection(id: string): boolean {
    const election = this.elections.find(e => e.id === id);
    if (election) {
      election.isActive = false;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Polling Station methods
  createPollingStation(stationNumber: string, location: string, address: string, registeredVoters?: number): PollingStation {
    const station = new PollingStation(stationNumber, location, address, registeredVoters);
    this.pollingStations.push(station);
    this.saveToStorage();
    return station;
  }

  getPollingStations(): PollingStation[] {
    return this.pollingStations.filter(ps => ps.isActive);
  }

  updatePollingStation(id: string, updates: Partial<PollingStation>): boolean {
    const station = this.pollingStations.find(ps => ps.id === id);
    if (station) {
      station.updateInfo(updates);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deletePollingStation(id: string): boolean {
    const station = this.pollingStations.find(ps => ps.id === id);
    if (station) {
      station.isActive = false;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Polling Station Member methods
  createPollingStationMember(firstName: string, lastName: string, dni: string, memberType: MemberType, phoneNumber?: string, email?: string): PollingStationMember {
    const member = new PollingStationMember(firstName, lastName, dni, memberType, phoneNumber, email);
    this.pollingStationMembers.push(member);
    this.saveToStorage();
    return member;
  }

  getPollingStationMembers(): PollingStationMember[] {
    return this.pollingStationMembers.filter(m => m.isActive);
  }

  updatePollingStationMember(id: string, updates: Partial<PollingStationMember>): boolean {
    const member = this.pollingStationMembers.find(m => m.id === id);
    if (member) {
      member.updateInfo(updates);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deletePollingStationMember(id: string): boolean {
    const member = this.pollingStationMembers.find(m => m.id === id);
    if (member) {
      member.deactivate();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Electoral Record methods
  createElectoralRecord(title: string, pollingStationId: string, place: string, recordNumber: string): ElectoralRecord | null {
    const pollingStation = this.pollingStations.find(ps => ps.id === pollingStationId);
    if (!pollingStation) return null;

    const record = new ElectoralRecord(title, pollingStation, place, recordNumber);
    this.electoralRecords.push(record);
    this.saveToStorage();
    return record;
  }

  getElectoralRecords(): ElectoralRecord[] {
    return this.electoralRecords;
  }

  updateElectoralRecord(id: string, updates: Partial<ElectoralRecord>): boolean {
    const record = this.electoralRecords.find(r => r.id === id);
    if (record && !record.isFinalized) {
      Object.assign(record, updates);
      record.updatedAt = new Date();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  private initializeDefaultData(): void {
    // Create default admin user
    const admin = new User('admin', 'admin123', 'Administrador', 'Sistema', 'admin');
    this.users.push(admin);

    // Create some default political parties
    const party1 = this.createPoliticalParty('Partido Nacional', 'PN', 'Juan Pérez');
    const party2 = this.createPoliticalParty('Partido Colorado', 'PC', 'María González');
    const party3 = this.createPoliticalParty('Frente Amplio', 'FA', 'Carlos Rodriguez');

    // Create some default candidates
    this.createCandidate('Ana', 'Silva', '12345678', party1.id, 'Alcalde');
    this.createCandidate('Pedro', 'López', '87654321', party2.id, 'Alcalde');
    this.createCandidate('Laura', 'Fernández', '11223344', party3.id, 'Alcalde');
  }

  private saveToStorage(): void {
    try {
      const data = {
        elections: this.elections,
        candidates: this.candidates,
        politicalParties: this.politicalParties,
        pollingStations: this.pollingStations,
        pollingStationMembers: this.pollingStationMembers,
        electoralRecords: this.electoralRecords,
        users: this.users
      };
      localStorage.setItem('electoralSystem', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('electoralSystem');
      if (data) {
        const parsed = JSON.parse(data);
        // Reconstruct objects with their methods
        this.elections = parsed.elections?.map((e: any) => Object.assign(new Election(e.name, new Date(e.date), e.electionType, e.description), e)) || [];
        this.candidates = parsed.candidates?.map((c: any) => Object.assign(new Candidate(c.firstName, c.lastName, c.dni, c.politicalParty, c.position), c)) || [];
        this.politicalParties = parsed.politicalParties?.map((p: any) => Object.assign(new PoliticalParty(p.name, p.acronym, p.legalRepresentative, p.logo), p)) || [];
        this.pollingStations = parsed.pollingStations?.map((ps: any) => Object.assign(new PollingStation(ps.stationNumber, ps.location, ps.address, ps.registeredVoters), ps)) || [];
        this.pollingStationMembers = parsed.pollingStationMembers?.map((m: any) => Object.assign(new PollingStationMember(m.firstName, m.lastName, m.dni, m.memberType, m.phoneNumber, m.email), m)) || [];
        this.electoralRecords = parsed.electoralRecords?.map((r: any) => Object.assign(new ElectoralRecord(r.title, r.pollingStation, r.place, r.recordNumber), r)) || [];
        this.users = parsed.users?.map((u: any) => Object.assign(new User(u.username, u.password, u.firstName, u.lastName, u.role), u)) || [];
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }
}

export const electoralService = new ElectoralService();