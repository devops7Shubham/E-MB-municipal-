import apiClient from './client';
import type { Work, WorkDetail } from '@/types';

export const worksApi = {
  /**
   * Get all works
   */
  async getWorks(): Promise<Work[]> {
    const response = await apiClient.get<Work[]>('/works');
    return response.data;
  },

  /**
   * Get single work detail
   */
  async getWork(id: number): Promise<WorkDetail> {
    const response = await apiClient.get<WorkDetail>(`/works/${id}`);
    return response.data;
  },

  /**
   * Download Excel file as blob
   */
  async downloadWorkFile(id: number): Promise<Blob> {
    const response = await apiClient.get(`/works/${id}/file`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Upload/Replace Excel file
   */
  async uploadWorkFile(id: number, file: File): Promise<WorkDetail> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.put<WorkDetail>(`/works/${id}/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Submit work for approval
   */
  async submitWork(id: number): Promise<WorkDetail> {
    const response = await apiClient.post<WorkDetail>(`/works/${id}/submit`);
    return response.data;
  },
};

export default worksApi;