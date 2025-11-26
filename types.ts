export enum UserRole {
  ADMIN = 'ADMIN',
  PRODUCTION = 'PRODUCTION',
  ENGINEERING = 'ENGINEERING',
}

export enum TicketType {
  REPAIR = 'REPAIR',
  PM = 'PM', // Preventive Maintenance
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
}

export interface HistoryLog {
  id: string;
  date: string; // ISO string
  description: string;
  userId: string;
  userRole: UserRole;
  userName: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  priority: PriorityLevel;
  status: TicketStatus;
  dateReported: string; // ISO string
  createdBy: string; // User ID
  createdByName: string; // User Name
  createdByRole: UserRole;
  imageUrl?: string; // Base64 or URL
  history: HistoryLog[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}