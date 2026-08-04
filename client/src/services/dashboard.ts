import api from './api';
import type { DashboardSummary } from '../types';

export const dashboardService = {
  async summary(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};