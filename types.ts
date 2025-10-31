export type ServiceType = 'عسكرية' | 'عسكرية مضاعفة' | 'جهادية' | 'اسر' | '';

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