import type { ApiResponse, ApiError } from './types';

export async function apiFetch<T>(endpoint: string, data: any = null): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      return { payload: null, error: err };
    }

    const payload = (await response.json()) as T;
    return { payload, error: null };
  }
  catch (err: any) {
    return { payload: null, error: [Date.now(), 500, 'E_NETWORK_ERROR', {}] as ApiError };
  }
}
