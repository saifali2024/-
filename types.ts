export type ServiceType = 'عسكرية' | 'حركات' | '';

export interface ServiceRow {
  id: number;
  serviceType: ServiceType;
  start: string;
  end: string;
  duration: Duration | null;
}

export interface Duration {
  years: number;
  months: number;
  days: number;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: number;
}
