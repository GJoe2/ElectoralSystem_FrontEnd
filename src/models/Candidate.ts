import { IEntity } from '../types/interfaces';
import { PoliticalParty } from './PoliticalParty';

export class Candidate implements IEntity {
  public id: string;
  public firstName: string;
  public lastName: string;
  public dni: string;
  public politicalParty: PoliticalParty;
  public position: string;
  public isActive: boolean;
  public votes: number;
  public preferentialVotes: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    firstName: string,
    lastName: string,
    dni: string,
    politicalParty: PoliticalParty,
    position: string = 'Candidato'
  ) {
    this.id = this.generateId();
    this.firstName = firstName;
    this.lastName = lastName;
    this.dni = dni;
    this.politicalParty = politicalParty;
    this.position = position;
    this.isActive = true;
    this.votes = 0;
    this.preferentialVotes = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  addVote(isPreferential: boolean = false): void {
    this.votes++;
    if (isPreferential) {
      this.preferentialVotes++;
    }
    this.updatedAt = new Date();
  }

  getTotalVotes(): number {
    return this.votes;
  }

  updateInfo(updates: Partial<Candidate>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}