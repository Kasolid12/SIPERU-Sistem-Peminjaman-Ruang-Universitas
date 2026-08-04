import api from './api';
import type { Room, RoomCreateInput, PaginatedResponse, SyncResult } from '../types';

export const roomService = {
  async list(search?: string): Promise<PaginatedResponse<Room>> {
    const params = search ? { search } : {};
    const { data } = await api.get<PaginatedResponse<Room>>('/rooms', { params });
    return data;
  },

  async getById(id: number): Promise<Room> {
    const { data } = await api.get<Room>(`/rooms/${id}`);
    return data;
  },

  async create(input: RoomCreateInput): Promise<Room> {
    const { data } = await api.post<Room>('/rooms', input);
    return data;
  },

  async update(id: number, input: Partial<RoomCreateInput>): Promise<Room> {
    const { data } = await api.put<Room>(`/rooms/${id}`, input);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },

  async sync(): Promise<SyncResult> {
    const { data } = await api.post<SyncResult>('/rooms/sync');
    return data;
  },
};