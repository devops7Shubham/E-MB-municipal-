export interface Work {
  id: number;
  name: string;
  contractor: string;
  agreement_number: string;
  status: 'draft' | 'submitted';
  file_path?: string;
}

export interface WorkDetail extends Work {
  file_path: string;
}

export type WorkStatus = Work['status'];

export interface ApiError {
  message: string;
  status?: number;
}