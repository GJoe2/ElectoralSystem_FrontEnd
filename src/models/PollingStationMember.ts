import { IEntity, MemberType } from '../types/interfaces';

export class PollingStationMember implements IEntity {
  public id: string;
  public firstName: string;
  public lastName: string;
  public dni: string;
  public memberType: MemberType;
  public phoneNumber: string;
  public email: string;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    firstName: string,
    lastName: string,
    dni: string,
    memberType: MemberType,
    phoneNumber: string = '',
    email: string = ''
  ) {
    this.id = this.generateId();
    this.firstName = firstName;
    this.lastName = lastName;
    this.dni = dni;
    this.memberType = memberType;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getMemberTypeLabel(): string {
    const labels = {
      'presidente': 'Presidente',
      'secretario': 'Secretario',
      'vocal': 'Vocal'
    };
    return labels[this.memberType];
  }

  updateInfo(updates: Partial<PollingStationMember>): void {
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