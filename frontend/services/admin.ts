import { apiClient } from './api';

export interface FakeDataRequest {
  user_count?: number;
  guests_per_wedding?: number;
  vendors_per_wedding?: number;
  expenses_per_wedding?: number;
  timeline_events_per_wedding?: number;
}

export interface FakeDataResponse {
  message: string;
  summary: {
    users_created: number;
    weddings_created: number;
    guests_created: number;
    vendors_created: number;
    expenses_created: number;
    timeline_events_created: number;
    wedding_cards_created: number;
  };
  details: {
    users: Array<{ id: number; username: string; email: string }>;
    weddings: Array<{ id: number; couple_names: string; wedding_date: string }>;
  };
}

export interface SampleWeddingRequest {
  user_id?: number;
  guest_count?: number;
  vendor_count?: number;
  expense_count?: number;
}

export interface SampleWeddingResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  wedding: {
    id: number;
    couple_names: string;
    wedding_date: string;
    venue: string;
    budget: number;
  };
  created_counts: {
    guests: number;
    vendors: number;
    expenses: number;
    wedding_cards: number;
  };
}

export interface DataStatisticsResponse {
  statistics: {
    users: number;
    weddings: number;
    guests: number;
    vendors: number;
    expenses: number;
    wedding_cards: number;
    total_budget: number;
    total_expenses: number;
  };
  averages: {
    guests_per_wedding: number;
    vendors_per_wedding: number;
    expenses_per_wedding: number;
    budget_per_wedding: number;
    expenses_per_budget: number;
  };
}

export class AdminService {
  static async generateFakeData(request: FakeDataRequest): Promise<FakeDataResponse> {
    return apiClient.post<FakeDataResponse>('/admin/generate-fake-data/', request);
  }

  static async generateSampleWedding(request: SampleWeddingRequest): Promise<SampleWeddingResponse> {
    return apiClient.post<SampleWeddingResponse>('/admin/generate-sample-wedding/', request);
  }

  static async createDefaultAccounts(): Promise<any> {
    return apiClient.post('/admin/create-default-accounts/');
  }

  static async clearFakeData(): Promise<{ message: string; deleted_counts: any }> {
    return apiClient.delete('/admin/clear-fake-data/');
  }

  static async getDataStatistics(): Promise<DataStatisticsResponse> {
    return apiClient.get<DataStatisticsResponse>('/admin/data-statistics/');
  }
}

export default AdminService;
