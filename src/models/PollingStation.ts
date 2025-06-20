import { IEntity } from '../types/interfaces';
import { PollingStationMember } from './PollingStationMember';

export class PollingStation implements IEntity {
  public id: string;
  public stationNumber: string;
  public location: string;
  public address: string;
  public members: PollingStationMember[];
  public registeredVoters: number;
  public effectiveVoters: number;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    stationNumber: string,
    location: string,
    address: string,
    registeredVoters: number = 0
  ) {
    this.id = this.generateId();
    this.stationNumber = stationNumber;
    this.location = location;
    this.address = address;
    this.members = [];
    this.registeredVoters = registeredVoters;
    this.effectiveVoters = 0;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addMember(member: PollingStationMember): void {
    const existingMemberIndex = this.members.findIndex(m => m.memberType === member.memberType);
    if (existingMemberIndex !== -1) {
      this.members[existingMemberIndex] = member;
    } else {
      this.members.push(member);
    }
    this.updatedAt = new Date();
  }

  removeMember(memberType: string): void {
    this.members = this.members.filter(m => m.memberType !== memberType);
    this.updatedAt = new Date();
  }

  getPresident(): PollingStationMember | undefined {
    return this.members.find(m => m.memberType === 'presidente');
  }

  getSecretary(): PollingStationMember | undefined {
    return this.members.find(m => m.memberType === 'secretario');
  }

  getVocals(): PollingStationMember[] {
    return this.members.filter(m => m.memberType === 'vocal');
  }

  updateVoterCount(effectiveVoters: number): void {
    this.effectiveVoters = effectiveVoters;
    this.updatedAt = new Date();
  }

  getTurnoutPercentage(): number {
    if (this.registeredVoters === 0) return 0;
    return (this.effectiveVoters / this.registeredVoters) * 100;
  }

  updateInfo(updates: Partial<PollingStation>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}