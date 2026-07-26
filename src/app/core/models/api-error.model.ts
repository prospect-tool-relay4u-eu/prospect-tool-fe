export type ApiErrorCategory = 'network' | 'timeout' | 'server';

export interface ApiError {
  status: number;
  code?: string;
  detail?: string;
  correlationId?: string;
  errors?: Record<string, string>;
  category?: ApiErrorCategory;
}
