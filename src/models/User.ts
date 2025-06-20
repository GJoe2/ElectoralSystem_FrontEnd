import { IEntity, IAuthenticable, LoginCredentials, UserRole } from '../types/interfaces';

export class User implements IEntity, IAuthenticable {
  public id: string;
  public username: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public role: UserRole;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = 'operator'
  ) {
    this.id = this.generateId();
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  authenticate(credentials: LoginCredentials): boolean {
    return this.username === credentials.username && 
           this.password === credentials.password && 
           this.isActive;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasPermission(requiredRole: UserRole): boolean {
    const roleHierarchy = { 'observer': 1, 'operator': 2, 'admin': 3 };
    return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}