import { IEntity } from '../types/interfaces';

export class PoliticalParty implements IEntity {
  public id: string;
  public name: string;
  public acronym: string;
  public logo: string;
  public legalRepresentative: string;
  public foundedDate: Date;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    acronym: string,
    legalRepresentative: string,
    logo?: string
  ) {
    this.id = this.generateId();
    this.name = name;
    this.acronym = acronym.toUpperCase();
    this.logo = logo || '';
    this.legalRepresentative = legalRepresentative;
    this.foundedDate = new Date();
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateInfo(updates: Partial<PoliticalParty>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}