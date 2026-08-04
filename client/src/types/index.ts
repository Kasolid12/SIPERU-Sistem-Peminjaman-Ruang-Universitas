/** Shared types untuk SIPERU frontend */

export type Role = 'ADMIN' | 'DOSEN';

export type StatusBooking = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';

export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Room {
  id: number;
  nama: string;
  lokasi: string;
  kapasitas: number;
  externalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreateInput {
  nama: string;
  lokasi: string;
  kapasitas: number;
}

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  keperluan: string;
  status: StatusBooking;
  createdAt: string;
  updatedAt: string;
  room: Room;
  user: Pick<User, 'id' | 'nama' | 'email'>;
}

export interface BookingCreateInput {
  roomId: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  keperluan: string;
}

export interface DashboardSummary {
  totalRooms: number;
  totalBookings: number;
  statusCount: Record<StatusBooking, number>;
  todayBookings: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface SyncResult {
  synced: number;
  totalAvailable: number;
}

export const STATUS_LABELS: Record<StatusBooking, string> = {
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  SELESAI: 'Selesai',
};

export const STATUS_COLORS: Record<StatusBooking, { bg: string; text: string; dot: string }> = {
  MENUNGGU:  { bg: '#FEF3E2', text: '#C08A3E', dot: '#C08A3E' },
  DISETUJUI: { bg: '#EAF4ED', text: '#5F8D6B', dot: '#5F8D6B' },
  DITOLAK:   { bg: '#F8EDEC', text: '#B4574F', dot: '#B4574F' },
  SELESAI:   { bg: '#F0F1F3', text: '#6B7280', dot: '#6B7280' },
};