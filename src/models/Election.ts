import { IEntity, IReportable, ElectionType, ElectionReport, CandidateResult } from '../types/interfaces';
import { Candidate } from './Candidate';
import { ElectoralRecord } from './ElectoralRecord';
import { PollingStation } from './PollingStation';

export class Election implements IEntity, IReportable {
  public id: string;
  public name: string;
  public date: Date;
  public electionType: ElectionType;
  public candidates: Candidate[];
  public pollingStations: PollingStation[];
  public electoralRecords: ElectoralRecord[];
  public isActive: boolean;
  public isFinalized: boolean;
  public description: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    date: Date,
    electionType: ElectionType,
    description: string = ''
  ) {
    this.id = this.generateId();
    this.name = name;
    this.date = date;
    this.electionType = electionType;
    this.candidates = [];
    this.pollingStations = [];
    this.electoralRecords = [];
    this.isActive = true;
    this.isFinalized = false;
    this.description = description;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addCandidate(candidate: Candidate): void {
    this.candidates.push(candidate);
    this.updatedAt = new Date();
  }

  removeCandidate(candidateId: string): void {
    this.candidates = this.candidates.filter(c => c.id !== candidateId);
    this.updatedAt = new Date();
  }

  addPollingStation(pollingStation: PollingStation): void {
    this.pollingStations.push(pollingStation);
    this.updatedAt = new Date();
  }

  removePollingStation(stationId: string): void {
    this.pollingStations = this.pollingStations.filter(ps => ps.id !== stationId);
    this.updatedAt = new Date();
  }

  addElectoralRecord(record: ElectoralRecord): void {
    this.electoralRecords.push(record);
    this.processVotes(record);
    this.updatedAt = new Date();
  }

  private processVotes(record: ElectoralRecord): void {
    record.voteRecords.forEach(voteRecord => {
      const candidate = this.candidates.find(c => c.id === voteRecord.candidateId);
      if (candidate) {
        candidate.votes += voteRecord.votes;
        candidate.preferentialVotes += voteRecord.preferentialVotes;
      }
    });
  }

  getTotalVotes(): number {
    return this.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  }

  getTotalBlankVotes(): number {
    return this.electoralRecords.reduce((sum, record) => sum + record.blankVotes, 0);
  }

  getTotalNullVotes(): number {
    return this.electoralRecords.reduce((sum, record) => sum + record.nullVotes, 0);
  }

  getWinner(): Candidate | null {
    if (this.candidates.length === 0) return null;
    return this.candidates.reduce((winner, candidate) => 
      candidate.votes > winner.votes ? candidate : winner
    );
  }

  generateReport(): ElectionReport {
    const totalVotes = this.getTotalVotes();
    const results: CandidateResult[] = this.candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.getFullName(),
      votes: candidate.votes,
      preferentialVotes: candidate.preferentialVotes,
      percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
    }));

    return {
      electionId: this.id,
      totalVotes,
      results: results.sort((a, b) => b.votes - a.votes),
      blankVotes: this.getTotalBlankVotes(),
      nullVotes: this.getTotalNullVotes(),
      generatedAt: new Date()
    };
  }

  finalize(): void {
    this.isFinalized = true;
    this.updatedAt = new Date();
  }

  updateInfo(updates: Partial<Election>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}