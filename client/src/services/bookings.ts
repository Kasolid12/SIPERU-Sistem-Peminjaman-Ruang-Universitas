import api from './api';
import type { Booking, BookingCreateInput, PaginatedResponse, StatusBooking } from '../types';

export const bookingService = {
  async list(params?: { status?: StatusBooking; tanggal?: string }): Promise<PaginatedResponse<Booking>> {
    const { data } = await api.get<PaginatedResponse<Booking>>('/bookings', { params });
    return data;
  },

  async getById(id: number): Promise<Booking> {
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
  },

  async create(input: BookingCreateInput): Promise<Booking> {
    const { data } = await api.post<Booking>('/bookings', input);
    return data;
  },

  async setStatus(id: number, status: StatusBooking): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}/status`, { status });
    return data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },
};