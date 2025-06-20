import { IEntity } from '../types/interfaces';
import { PollingStation } from './PollingStation';
import { Candidate } from './Candidate';

export interface VoteRecord {
  candidateId: string;
  votes: number;
  preferentialVotes: number;
}

export class ElectoralRecord implements IEntity {
  public id: string;
  public title: string;
  public date: Date;
  public time: string;
  public place: string;
  public pollingStation: PollingStation;
  public recordNumber: string;
  public totalRegisteredVoters: number;
  public totalEffectiveVoters: number;
  public voteRecords: VoteRecord[];
  public blankVotes: number;
  public nullVotes: number;
  public observations: string;
  public signatures: string[];
  public officialSeal: string;
  public isFinalized: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    title: string,
    pollingStation: PollingStation,
    place: string,
    recordNumber: string
  ) {
    this.id = this.generateId();
    this.title = title;
    this.date = new Date();
    this.time = new Date().toLocaleTimeString();
    this.place = place;
    this.pollingStation = pollingStation;
    this.recordNumber = recordNumber;
    this.totalRegisteredVoters = pollingStation.registeredVoters;
    this.totalEffectiveVoters = 0;
    this.voteRecords = [];
    this.blankVotes = 0;
    this.nullVotes = 0;
    this.observations = '';
    this.signatures = [];
    this.officialSeal = '';
    this.isFinalized = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addVoteRecord(candidateId: string, votes: number, preferentialVotes: number = 0): void {
    const existingRecord = this.voteRecords.find(vr => vr.candidateId === candidateId);
    if (existingRecord) {
      existingRecord.votes = votes;
      existingRecord.preferentialVotes = preferentialVotes;
    } else {
      this.voteRecords.push({ candidateId, votes, preferentialVotes });
    }
    this.calculateTotalVotes();
    this.updatedAt = new Date();
  }

  setBlankAndNullVotes(blankVotes: number, nullVotes: number): void {
    this.blankVotes = blankVotes;
    this.nullVotes = nullVotes;
    this.calculateTotalVotes();
    this.updatedAt = new Date();
  }

  private calculateTotalVotes(): void {
    const candidateVotes = this.voteRecords.reduce((sum, record) => sum + record.votes, 0);
    this.totalEffectiveVoters = candidateVotes + this.blankVotes + this.nullVotes;
  }

  addSignature(signature: string): void {
    this.signatures.push(signature);
    this.updatedAt = new Date();
  }

  addObservation(observations: string): void {
    this.observations = observations;
    this.updatedAt = new Date();
  }

  finalize(officialSeal: string): void {
    this.officialSeal = officialSeal;
    this.isFinalized = true;
    this.updatedAt = new Date();
  }

  getTotalValidVotes(): number {
    return this.voteRecords.reduce((sum, record) => sum + record.votes, 0);
  }

  getTurnoutPercentage(): number {
    if (this.totalRegisteredVoters === 0) return 0;
    return (this.totalEffectiveVoters / this.totalRegisteredVoters) * 100;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}