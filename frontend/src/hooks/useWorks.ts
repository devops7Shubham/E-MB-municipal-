import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worksApi } from '@/api/works';
import type { Work, WorkDetail } from '@/types';

export const QUERY_KEYS = {
  WORKS: 'works',
  WORK: (id: number) => ['work', id],
  WORK_FILE: (id: number) => ['workFile', id],
};

/**
 * Hook to fetch all works
 */
export function useWorks() {
  return useQuery<Work[], { message: string }>({
    queryKey: [QUERY_KEYS.WORKS],
    queryFn: worksApi.getWorks,
  });
}

/**
 * Hook to fetch single work detail
 */
export function useWork(id: number) {
  return useQuery<WorkDetail, { message: string }>({
    queryKey: QUERY_KEYS.WORK(id),
    queryFn: () => worksApi.getWork(id),
    enabled: !!id,
  });
}

/**
 * Hook to submit work for approval
 */
export function useSubmitWork() {
  const queryClient = useQueryClient();

  return useMutation<WorkDetail, { message: string }, number>({
    mutationFn: worksApi.submitWork,
    onSuccess: (data) => {
      // Update the work in the list
      queryClient.setQueryData([QUERY_KEYS.WORK, data.id], data);
      // Invalidate works list to refresh status
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKS] });
    },
  });
}

/**
 * Hook to upload work file
 */
export function useUploadWorkFile() {
  const queryClient = useQueryClient();

  return useMutation<WorkDetail, { message: string }, { id: number; file: File }>({
    mutationFn: ({ id, file }) => worksApi.uploadWorkFile(id, file),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.WORK, data.id], data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORK_FILE(data.id) });
    },
  });
}