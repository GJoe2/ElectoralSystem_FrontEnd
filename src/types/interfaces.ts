// Core interfaces for the electoral system
export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthenticable {
  authenticate(credentials: LoginCredentials): boolean;
}

export interface IReportable {
  generateReport(): ElectionReport;
}

export interface IVotable {
  castVote(candidateId: string, isPreferential?: boolean): void;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ElectionReport {
  electionId: string;
  totalVotes: number;
  results: CandidateResult[];
  blankVotes: number;
  nullVotes: number;
  generatedAt: Date;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  votes: number;
  preferentialVotes: number;
  percentage: number;
}

export type ElectionType = 'municipal' | 'national' | 'referendum';
export type MemberType = 'presidente' | 'secretario' | 'vocal';
export type UserRole = 'admin' | 'operator' | 'observer';